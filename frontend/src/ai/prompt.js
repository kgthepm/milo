export function normalizeTitle(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildRecommendationPrompt(userMovies, type, contentType) {
  const contentLabel = contentType === 'tv' ? 'TV series' : 'movies';

  const systemPrompt = `You are a ${contentLabel} recommendation expert. Analyze the user's viewing history and provide personalized recommendations.

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

  if (!userMovies || userMovies.length === 0) {
    return {
      systemPrompt,
      userPrompt: `The user has no ${contentLabel} in their database. Suggest 5 popular ${contentLabel} across different genres to help them get started.`,
    };
  }

  const topRated = [...userMovies]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map(
      (m) =>
        `${m.title} (${m.rating}/10${m.genre ? ', ' + m.genre : ''}${m.director ? ', dir. ' + m.director : ''})`
    )
    .join('\n- ');

  const watchedSorted = [...userMovies]
    .sort((a, b) => {
      const ad = a.date_watched || a.created_at || '';
      const bd = b.date_watched || b.created_at || '';
      return bd.localeCompare(ad);
    })
    .slice(0, 300);
  const watchedTitlesList = [...new Set(watchedSorted.map((m) => m.title).filter(Boolean))]
    .map((t) => `- ${t}`)
    .join('\n');
  const exclusionBlock = `\n\nIMPORTANT: I have already watched the following ${contentLabel}. Do NOT recommend any of these, or any obvious re-releases / remasters / alternate cuts / sequels-I've-already-seen of them:\n\n${watchedTitlesList}\n\nReturn only titles I have NOT seen.`;

  let userPrompt = '';
  if (type === 'similar') {
    userPrompt = `Based on these highly-rated ${contentLabel} I've enjoyed:

- ${topRated}

Analyze the patterns in my preferences (genre, director, themes, style). Recommend 5 ${contentLabel} that are very similar to what I love, explaining why each matches my taste.

Consider:
- Similar genres and sub-genres
- Directors or creators with similar styles
- Comparable themes and storytelling approaches
- Similar production era or aesthetic`;
  } else if (type === 'hidden_gems') {
    userPrompt = `Based on these ${contentLabel} I've watched and rated:

- ${topRated}

I want to discover lesser-known ${contentLabel} (hidden gems) that match my taste. Recommend 5 ${contentLabel} that are:
- Not mainstream blockbusters or huge hits
- Highly rated but may have flown under the radar
- Perfect match for my preferences based on my viewing history

For each, explain why it's a hidden gem that fits my taste perfectly.`;
  } else {
    userPrompt = `Based on these ${contentLabel}:\n- ${topRated}\n\nRecommend 5 ${contentLabel} I'd enjoy.`;
  }

  userPrompt += exclusionBlock;

  return { systemPrompt, userPrompt };
}

export function buildAssistantPrompt(userMessage, movies = [], tvSeries = [], analytics = null, history = []) {
  let context = 'User viewing history:\n\n';

  if (movies.length > 0) {
    const topMovies = [...movies]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
      .map(
        (m) =>
          `${m.title} (${m.rating}/10${m.genre ? ', ' + m.genre : ''}${m.director ? ', dir. ' + m.director : ''})`
      )
      .join('\n- ');
    const genres = [...new Set(movies.map((m) => m.genre).filter(Boolean))];
    const directors = [...new Set(movies.map((m) => m.director).filter(Boolean))];
    context += `Top rated movies:\n- ${topMovies}\n`;
    if (genres.length) context += `\nFavorite movie genres: ${genres.join(', ')}\n`;
    if (directors.length) context += `Favorite directors: ${directors.join(', ')}\n`;
  }

  if (tvSeries.length > 0) {
    const topTV = [...tvSeries]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
      .map(
        (t) =>
          `${t.title} (${t.rating}/10${t.genre ? ', ' + t.genre : ''}${t.num_seasons ? ', ' + t.num_seasons + ' seasons' : ''})`
      )
      .join('\n- ');
    const tvGenres = [...new Set(tvSeries.map((t) => t.genre).filter(Boolean))];
    context += `\nTop rated TV series:\n- ${topTV}\n`;
    if (tvGenres.length) context += `\nFavorite TV genres: ${tvGenres.join(', ')}\n`;
  }

  if (analytics) {
    context += `\nTotal content watched: ${analytics.totalWatched || 0}\n`;
    context += `Average rating: ${analytics.averageRating?.toFixed?.(1) || 'N/A'}/10\n`;
  }

  const systemPrompt = `You are MILO (Movie Intelligence & Learning Overseer), a sophisticated AI assistant for a personal movie and TV tracking application.

Your personality:
- Professional, knowledgeable, and slightly witty
- Helpful and concise in your responses
- Deeply passionate about movies and TV shows
- Like a friendly film critic or knowledgeable cinema enthusiast

Guidelines:
- Keep responses focused and concise (2-4 sentences typically)
- Be specific and personalized using their actual viewing history
- When recommending, explain WHY it fits their taste
- If they have no history, suggest popular titles to get started
- Be encouraging about their viewing journey

Context about the user:
${context}`;

  const recent = Array.isArray(history) ? history.slice(-20) : [];
  const transcriptLines = recent
    .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => `${m.role === 'user' ? 'User' : 'MILO'}: ${m.content}`);
  const userPrompt = transcriptLines.length
    ? `Previous conversation:\n${transcriptLines.join('\n')}\n\nCurrent message: ${userMessage}`
    : userMessage;

  return { systemPrompt, userPrompt };
}

export function parseRecommendationsJSON(text) {
  if (!text) return null;
  try {
    const match = text.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch {
    return null;
  }
}
