import { buildRecommendationPrompt, buildAssistantPrompt } from './prompt';
import * as openrouter from './providers/openrouter';
import * as anthropic from './providers/anthropic';
import * as ollama from './providers/ollama';
import * as zai from './providers/zai';
import * as deepseek from './providers/deepseek';
import * as groq from './providers/groq';
import * as xai from './providers/xai';
import * as mistral from './providers/mistral';
import * as together from './providers/together';
import * as cerebras from './providers/cerebras';
import * as fireworks from './providers/fireworks';
import * as googleai from './providers/googleai';
import { loadAISettings, getActiveKey } from '../utils/aiSettings';

const REGISTRY = {
  openrouter, anthropic, ollama,
  zai, deepseek, groq, xai, mistral, together, cerebras, fireworks, googleai,
};

export function getProvider(name) {
  const p = REGISTRY[name];
  if (!p) throw new Error(`Unknown AI provider: ${name}`);
  return p;
}

function providerCallOpts(settings, extra = {}) {
  if (settings.provider === 'ollama') {
    return { ollamaUrl: settings.ollamaUrl, model: settings.model, ...extra };
  }
  return { apiKey: getActiveKey(settings), model: settings.model, ...extra };
}

export async function listModels(settings = loadAISettings(), { signal } = {}) {
  const provider = getProvider(settings.provider);
  return provider.listModels({ ...providerCallOpts(settings), signal });
}

export async function generateRecommendations({
  userMovies,
  type,
  contentType,
  settings = loadAISettings(),
  signal,
} = {}) {
  const { systemPrompt, userPrompt } = buildRecommendationPrompt(userMovies, type, contentType);
  const provider = getProvider(settings.provider);
  return provider.generateRecommendations({
    systemPrompt,
    userPrompt,
    ...providerCallOpts(settings),
    signal,
  });
}

export async function chatAssistant({
  message,
  movies = [],
  tvSeries = [],
  analytics = null,
  settings = loadAISettings(),
  signal,
} = {}) {
  const { systemPrompt, userPrompt } = buildAssistantPrompt(message, movies, tvSeries, analytics);
  const provider = getProvider(settings.provider);
  const response = await provider.chatAssistant({
    systemPrompt,
    userPrompt,
    ...providerCallOpts(settings),
    signal,
  });
  return { response, modelUsed: settings.model, provider: settings.provider };
}
