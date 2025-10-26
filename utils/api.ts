/**
 * API Client Utility
 * Centralized API request handler with error handling
 */

import { Config, buildApiUrl } from '@/constants/config';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Make an API request
 * @param endpoint - API endpoint (can be relative or full URL)
 * @param options - Request options
 * @returns Promise with the API response
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    token,
  } = options;

  try {
    const url = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if token is provided
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for POST, PUT, PATCH requests
    if (body && method !== 'GET' && method !== 'DELETE') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    // Parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle HTTP errors
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `HTTP Error: ${response.status}`,
        data: data,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: error.message || 'Network request failed',
    };
  }
}

/**
 * API Client with common methods
 */
export const api = {
  get: <T = any>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'GET', token }),

  post: <T = any>(endpoint: string, body?: any, token?: string) =>
    apiRequest<T>(endpoint, { method: 'POST', body, token }),

  put: <T = any>(endpoint: string, body?: any, token?: string) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, token }),

  patch: <T = any>(endpoint: string, body?: any, token?: string) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body, token }),

  delete: <T = any>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE', token }),
};

/**
 * Example usage:
 *
 * // Simple GET request
 * const response = await api.get('/api/templates/list');
 *
 * // POST request with body
 * const response = await api.post('/api/resume/create', {
 *   title: 'My Resume',
 *   content: '...'
 * });
 *
 * // Authenticated request
 * const token = 'your-auth-token';
 * const response = await api.get('/api/resume/list', token);
 *
 * // Using Config endpoints
 * const response = await api.get(Config.endpoints.templates.list);
 */
