require('dotenv').config();

const http = require('http');

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function normalizeTitle(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function librarySignature(userMovies) {
  if (!userMovies || userMovies.length === 0) return '0:';
  const last = userMovies[userMovies.length - 1];
  return `${userMovies.length}:${last?.id ?? ''}`;
}

// Generate cache key
function getCacheKey(contentType, type, model, sig) {
  return `${contentType}:${type}:${model}:${sig}`;
}

// Check if cache is valid
function isCacheValid(cacheEntry) {
  return cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL);
}

// Get cached recommendations
function getCachedRecommendations(contentType, type, model, sig) {
  const key = getCacheKey(contentType, type, model, sig);
  const entry = cache.get(key);

  if (isCacheValid(entry)) {
    return entry.data;
  }

  cache.delete(key);
  return null;
}

// Cache recommendations
function cacheRecommendations(contentType, type, model, sig, data) {
  const key = getCacheKey(contentType, type, model, sig);
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Clear cache for specific key
function clearCache(contentType, type, model) {
  if (model) {
    const prefix = `${contentType}:${type}:${model}:`;
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) cache.delete(key);
    }
  } else {
    // Clear all entries matching contentType:type for any model
    for (const key of cache.keys()) {
      if (key.startsWith(`${contentType}:${type}:`)) cache.delete(key);
    }
  }
}

// Build recommendation prompt based on type
function buildRecommendationPrompt(userMovies, type, contentType) {
  const contentLabel = contentType === 'tv' ? 'TV series' : 'movies';
  
  let systemPrompt = `You are a ${contentLabel} recommendation expert. Analyze the user's viewing history and provide personalized recommendations.

Never recommend a title the user has already watched.

Return ONLY valid JSON in this format:
{
  "recommendations": [
    {
      "title": "string",
      "year": "number",
      "genre": "string",
      "explanation": "brief explanation (50-100 words)",
      "confidence": 1-10
    }
  ]
}`;

  let userPrompt = '';
  
  if (userMovies.length === 0) {
    return {
      systemPrompt,
      userPrompt: `The user has no ${contentLabel} in their database. Suggest 5 popular ${contentLabel} across different genres to help them get started.`
    };
  }

  const topRated = userMovies
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map(m => `${m.title} (${m.rating}/10${m.genre ? ', ' + m.genre : ''}${m.director ? ', dir. ' + m.director : ''})`)
    .join('\n- ');

  const genres = [...new Set(userMovies.map(m => m.genre).filter(Boolean))];
  const directors = [...new Set(userMovies.map(m => m.director).filter(Boolean))];

  const watchedSorted = [...userMovies]
    .sort((a, b) => {
      const ad = a.date_watched || a.created_at || '';
      const bd = b.date_watched || b.created_at || '';
      return String(bd).localeCompare(String(ad));
    })
    .slice(0, 300);
  const watchedTitlesList = [...new Set(watchedSorted.map(m => m.title).filter(Boolean))]
    .map(t => `- ${t}`)
    .join('\n');
  const exclusionBlock = `\n\nIMPORTANT: I have already watched the following ${contentLabel}. Do NOT recommend any of these, or any obvious re-releases / remasters / alternate cuts / sequels-I've-already-seen of them:\n\n${watchedTitlesList}\n\nReturn only titles I have NOT seen.`;

  if (type === 'similar') {
    userPrompt = `Based on these highly-rated ${contentLabel} I've enjoyed:

${topRated}

Analyze the patterns in my preferences (genre, director, themes, style). Recommend 5 ${contentLabel} that are very similar to what I love, explaining why each matches my taste.

Consider:
- Similar genres and sub-genres
- Directors or creators with similar styles
- Comparable themes and storytelling approaches
- Similar production era or aesthetic`;
  } else if (type === 'hidden_gems') {
    userPrompt = `Based on these ${contentLabel} I've watched and rated:

${topRated}

I want to discover lesser-known ${contentLabel} (hidden gems) that match my taste. Recommend 5 ${contentLabel} that are:
- Not mainstream blockbusters or huge hits
- Highly rated but may have flown under the radar
- Perfect match for my preferences based on my viewing history

For each, explain why it's a hidden gem that fits my taste perfectly.`;
  }

  userPrompt += exclusionBlock;

  return { systemPrompt, userPrompt };
}

// Call Ollama API
async function callOllama(prompt, systemPrompt, model) {
  return new Promise((resolve, reject) => {
    if (!model) {
      reject(new Error('No model specified. Pick one from the dropdown.'));
      return;
    }
    const postData = JSON.stringify({
      model,
      prompt: systemPrompt + '\n\n' + prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1000
      }
    });

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const url = new URL(ollamaUrl);

    const options = {
      hostname: url.hostname,
      port: url.port || 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: parseInt(process.env.OLLAMA_TIMEOUT_MS, 10) || 480000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.response);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Ollama request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Parse Ollama response to extract JSON
function parseOllamaResponse(response) {
  try {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: try parsing entire response
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse Ollama response:', error.message);
    return null;
  }
}

// Main function to generate recommendations
async function generateRecommendations(userMovies, type = 'similar', contentType = 'movie', model) {
  const resolvedModel = model || process.env.OLLAMA_MODEL;
  if (!resolvedModel) {
    throw new Error('No model specified. Pick one from the dropdown.');
  }
  try {
    const sig = librarySignature(userMovies);
    const cached = getCachedRecommendations(contentType, type, resolvedModel, sig);
    if (cached) {
      return { recommendations: cached, cached: true };
    }

    const { systemPrompt, userPrompt } = buildRecommendationPrompt(userMovies, type, contentType);
    const response = await callOllama(userPrompt, systemPrompt, resolvedModel);
    const parsed = parseOllamaResponse(response);

    if (parsed && parsed.recommendations) {
      const watchedSet = new Set((userMovies || []).map(m => normalizeTitle(m.title)));
      const validRecommendations = parsed.recommendations.filter(rec =>
        rec.title && rec.explanation && rec.confidence >= 1 && rec.confidence <= 10
          && !watchedSet.has(normalizeTitle(rec.title))
      );

      if (validRecommendations.length > 0) {
        cacheRecommendations(contentType, type, resolvedModel, sig, validRecommendations);
        return { recommendations: validRecommendations, cached: false };
      }
    }

    return { recommendations: [], cached: false };
  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    throw error;
  }
}

// Clear all cache
function clearAllCache() {
  cache.clear();
}

module.exports = {
  generateRecommendations,
  clearCache,
  clearAllCache,
  getCachedRecommendations
};
