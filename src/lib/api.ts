
/**
 * Centralized API client for the application
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Generic fetch wrapper with error handling
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

// API client object with methods for different endpoints
export const api = {
  // Example method for fetching data
  get: <T>(endpoint: string, options?: RequestInit) => 
    fetchData<T>(endpoint, { ...options, method: 'GET' }),
  
  // Example method for posting data
  post: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchData<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  // Example method for updating data
  put: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchData<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  // Example method for deleting data
  delete: <T>(endpoint: string, options?: RequestInit) => 
    fetchData<T>(endpoint, { ...options, method: 'DELETE' }),
};
