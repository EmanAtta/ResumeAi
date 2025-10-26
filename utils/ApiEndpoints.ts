const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const ApiEndpoints = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
  },
  chat: {
    getAll: `${API_BASE_URL}/chat`,
    getById: (id: string) => `${API_BASE_URL}/chat/${id}`,
    sendMessage: `${API_BASE_URL}/chat`,
  },
};