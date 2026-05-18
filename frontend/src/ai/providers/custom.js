import { createOpenAICompatibleProvider } from './_openaiCompatible';

const provider = createOpenAICompatibleProvider({
  name: 'Custom',
  baseUrl: '',
  defaultModels: [],
});

export const { listModels, generateRecommendations, chatAssistant } = provider;
