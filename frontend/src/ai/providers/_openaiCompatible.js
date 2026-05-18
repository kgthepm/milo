import { parseRecommendationsJSON } from '../prompt';

export function createOpenAICompatibleProvider({
  name,
  baseUrl,
  modelsPath = '/models',
  defaultModels = [],
  extraHeaders = {},
}) {
  function authHeaders(apiKey) {
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
  }

  async function listModels({ apiKey, signal } = {}) {
    if (!apiKey) throw new Error(`${name} API key required.`);
    try {
      const res = await fetch(`${baseUrl}${modelsPath}`, { headers: authHeaders(apiKey), signal });
      if (!res.ok) return [...defaultModels];
      const json = await res.json();
      const ids = (json.data || json.models || [])
        .map((m) => m.id || m.name)
        .filter(Boolean);
      return ids.length ? ids : [...defaultModels];
    } catch {
      return [...defaultModels];
    }
  }

  async function chat({ apiKey, model, systemPrompt, userPrompt, signal, maxTokens = 1200 }) {
    if (!apiKey) throw new Error(`${name} API key required.`);
    if (!model) throw new Error('Pick a model from the dropdown.');
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: authHeaders(apiKey),
      signal,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`${name}: ${res.status} ${await res.text()}`);
    const json = await res.json();
    return json.choices?.[0]?.message?.content || '';
  }

  async function generateRecommendations({ systemPrompt, userPrompt, apiKey, model, signal }) {
    const text = await chat({ apiKey, model, systemPrompt, userPrompt, signal });
    const parsed = parseRecommendationsJSON(text);
    return parsed?.recommendations || [];
  }

  async function chatAssistant({ systemPrompt, userPrompt, apiKey, model, signal }) {
    return chat({ apiKey, model, systemPrompt, userPrompt, signal, maxTokens: 600 });
  }

  return { listModels, generateRecommendations, chatAssistant };
}
