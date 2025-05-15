
/**
 * Centralized API client for the application
 * 
 * This module provides a standardized way to make API requests with
 * proper error handling and consistent request configuration.
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 * 
 * @param endpoint API endpoint path (without base URL)
 * @param options Request options (method, headers, body, etc.)
 * @returns Promise resolving to the typed response data
 * @throws Error if the request fails
 * 
 * @example
 * ```typescript
 * // Basic GET request
 * const users = await fetchData<User[]>('/users');
 * 
 * // POST request with body
 * const result = await fetchData<CreateUserResponse>(
 *   '/users', 
 *   {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ name: 'John', email: 'john@example.com' })
 *   }
 * );
 * ```
 */
export const fetchData = async <T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * API client object with methods for different HTTP verbs
 * 
 * @example
 * ```typescript
 * // GET request
 * const user = await api.get<User>('/users/123');
 * 
 * // POST request
 * const createdUser = await api.post<User>('/users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * 
 * // PUT request
 * const updatedUser = await api.put<User>('/users/123', {
 *   name: 'John Smith'
 * });
 * 
 * // DELETE request
 * await api.delete('/users/123');
 * ```
 */
export const api = {
  /**
   * Make a GET request to the API
   * 
   * @param endpoint API endpoint path
   * @param options Additional request options
   * @returns Promise resolving to the typed response data
   */
  get: <T>(endpoint: string, options?: RequestInit) => 
    fetchData<T>(endpoint, { ...options, method: 'GET' }),
  
  /**
   * Make a POST request to the API
   * 
   * @param endpoint API endpoint path
   * @param data Request body data (will be JSON stringified)
   * @param options Additional request options
   * @returns Promise resolving to the typed response data
   */
  post: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchData<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  /**
   * Make a PUT request to the API
   * 
   * @param endpoint API endpoint path
   * @param data Request body data (will be JSON stringified)
   * @param options Additional request options
   * @returns Promise resolving to the typed response data
   */
  put: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchData<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  /**
   * Make a DELETE request to the API
   * 
   * @param endpoint API endpoint path
   * @param options Additional request options
   * @returns Promise resolving to the typed response data
   */
  delete: <T>(endpoint: string, options?: RequestInit) => 
    fetchData<T>(endpoint, { ...options, method: 'DELETE' }),
};
