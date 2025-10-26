import { ApiEndpoints } from "@/utils/ApiEndpoints";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
  error?: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(ApiEndpoints.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Expected JSON response but got HTML. Please check if the backend server is running at ' + ApiEndpoints.auth.login);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    return data;
  } catch (error: any) {
    // Network or parsing errors
    if (error.message.includes('JSON')) {
      throw new Error('Server error: Please ensure the backend is running at ' + ApiEndpoints.auth.login);
    }
    if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
      throw new Error('Network error: Cannot connect to server. Please check your connection and backend URL.');
    }
    throw error;
  }
};

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(ApiEndpoints.auth.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Expected JSON response but got HTML. Please check if the backend server is running at ' + ApiEndpoints.auth.register);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Signup failed');
    }

    return data;
  } catch (error: any) {
    // Network or parsing errors
    if (error.message.includes('JSON')) {
      throw new Error('Server error: Please ensure the backend is running at ' + ApiEndpoints.auth.register);
    }
    if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
      throw new Error('Network error: Cannot connect to server. Please check your connection and backend URL.');
    }
    throw error;
  }
};
