const STORAGE_KEY = 'milo.aiSettings.v1';

const DEFAULTS = {
  provider: 'openrouter',
  model: '',
  keys: {
    openrouter: '',
    anthropic: '',
    zai: '',
    zaiCoding: '',
    deepseek: '',
    groq: '',
    xai: '',
    mistral: '',
    together: '',
    cerebras: '',
    fireworks: '',
    googleai: '',
    custom: '',
  },
  ollamaUrl: 'http://localhost:11434',
  customBaseUrl: '',
  customLabel: '',
};

export function loadAISettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      keys: { ...DEFAULTS.keys, ...(parsed.keys || {}) },
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveAISettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getActiveKey(settings) {
  if (settings.provider === 'ollama') return null;
  return settings.keys?.[settings.provider] || '';
}

export const PROVIDERS = [
  'openrouter',
  'anthropic',
  'zai',
  'zaiCoding',
  'deepseek',
  'groq',
  'xai',
  'mistral',
  'together',
  'cerebras',
  'fireworks',
  'googleai',
  'custom',
  'ollama',
];

export const PROVIDER_GROUPS = [
  { label: 'Aggregator', providers: ['openrouter'] },
  {
    label: 'Direct providers',
    providers: ['anthropic', 'zai', 'zaiCoding', 'deepseek', 'groq', 'xai', 'mistral', 'together', 'cerebras', 'fireworks', 'googleai'],
  },
  { label: 'Custom / Local', providers: ['custom', 'ollama'] },
];
