/**
 * App Configuration
 * Access environment variables and app-wide configuration settings
 */

// Get environment variables
const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value || fallback || '';
};

export const Config = {
  // API Configuration
  API_BASE_URL: getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'http://localhost:3000'),

  // API Endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
    },
    resume: {
      create: '/api/resume/create',
      update: '/api/resume/update',
      delete: '/api/resume/delete',
      list: '/api/resume/list',
      get: (id: string) => `/api/resume/${id}`,
    },
    templates: {
      list: '/api/templates/list',
      get: (id: string) => `/api/templates/${id}`,
    },
    chat: {
      pdfs: '/chat/pdfs',
    },
  },

  // App Settings
  app: {
    name: 'ResumeAI',
    version: '1.0.0',
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = Config.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

// Helper function to check if API is configured
export const isApiConfigured = (): boolean => {
  return Boolean(Config.API_BASE_URL && Config.API_BASE_URL !== 'http://localhost:3000');
};
