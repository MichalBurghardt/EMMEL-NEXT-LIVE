/**
 * API Client for Emmel Reisen Management System
 * A centralized HTTP client for making API requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/api.types';

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage if we're in the browser
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle authentication errors
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          // Clear token and redirect to login if unauthorized
          localStorage.removeItem('auth_token');
          
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = `/login?redirect=${encodeURIComponent(
              window.location.pathname
            )}`;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Get singleton instance
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Generic request method
  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client({
        method,
        url,
        data,
        ...config,
      });

      if (response.data.status === 'error') {
        throw new Error(
          response.data.message || 'An unexpected error occurred'
        );
      }

      return response.data.data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle 404 errors specifically
        if (error.response?.status === 404) {
          console.warn(`Endpoint not found: ${url}`);
          throw new Error(`Resource not found: ${url.split('/').pop()}`);
        }
        
        if (error.response) {
          const errorData = error.response.data as ApiResponse;
          throw new Error(errorData.message || error.message);
        }
      }
      throw error;
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  // File upload method
  async uploadFile<T>(
    url: string, 
    file: File, 
    fieldName: string = 'file',
    onProgress?: (percentage: number) => void,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentage);
        }
      },
    };

    return this.post<T>(url, formData, uploadConfig);
  }
}

// Export a default instance
export default ApiClient.getInstance();

// Also export the class for testing or custom instances
export { ApiClient };