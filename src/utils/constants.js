export const ROUTES = {
  home: '/',
  generator: '/generator',
  learn: '/learn',
  chat: '/chat',
  docs: '/docs',
};

export const API = {
  aiChat: '/api/ai/chat',
  health: '/api/health',
  config: '/api/config',
};

export const STORAGE_KEYS = {
  theme: 'theme',
  forms: 'forms',
  bundle: 'bundle',
  snippets: 'snippets',
  recentResources: 'recent',
  envMode: 'env',
  beginnerMode: 'beginner',
  aiHistory: 'ai_history',
  aiHistoryFull: 'ai_history_full',
  aiModel: 'openrouter_model',
};

export const DEFAULT_AI_MODEL = 'google/gemma-3-27b-it:free';

export const AI_WELCOME = `👋 Hi! I'm your K8s AI assistant.

I can help you:
• 🔍 Review your YAML for issues
• 🛡️ Security audit your configs
• 💡 Suggest best practices
• 🔧 Debug deployment problems
• 📚 Explain any Kubernetes concept

Type a question or click a quick prompt below!`;
