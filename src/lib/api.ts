import axios, {
  type AxiosInstance,
  type AxiosProgressEvent,
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
} from 'axios'
import { ApiResponse, PaginatedResponse } from '@/types'

type RequestParams = Record<string, string | number | boolean | undefined>

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = window.localStorage.getItem('auth-token')
          if (token) {
            const headers = config.headers ?? {}
            if (typeof (headers as { set?: unknown }).set === 'function') {
              ;(headers as { set: (name: string, value: string) => void }).set(
                'Authorization',
                `Bearer ${token}`
              )
            } else {
              ;(headers as Record<string, unknown>).Authorization = `Bearer ${token}`
            }
            config.headers = headers
          }
        }
        return config
      },
      async (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('auth-token')
            window.location.href = '/auth/signin'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Generic request methods
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Paginated requests
  async getPaginated<T = unknown>(
    url: string,
    params?: RequestParams
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.client.get<PaginatedResponse<T>>(url, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // File upload
  async uploadFile<T = unknown>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private handleError(error: unknown): Error {
    if (isAxiosError(error)) {
      if (error.response) {
        const message =
          (error.response.data as { message?: string; error?: string })?.message ||
          (error.response.data as { message?: string; error?: string })?.error ||
          'An error occurred'
        return new Error(message)
      }

      if (error.request) {
        return new Error('Network error - please check your connection')
      }

      return new Error(error.message || 'An unexpected error occurred')
    }

    if (error instanceof Error) {
      return error
    }

    return new Error('An unexpected error occurred')
  }

  // Set auth token
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token)
    }
  }

  // Clear auth token
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization']
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export individual methods for convenience
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) =>
    apiClient.post<T, D>(url, data, config),
  put: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) =>
    apiClient.put<T, D>(url, data, config),
  patch: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) =>
    apiClient.patch<T, D>(url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
  getPaginated: <T = unknown>(url: string, params?: RequestParams) => apiClient.getPaginated<T>(url, params),
  uploadFile: <T = unknown>(url: string, file: File, onProgress?: (progress: number) => void) =>
    apiClient.uploadFile<T>(url, file, onProgress),
  setAuthToken: (token: string) => apiClient.setAuthToken(token),
  clearAuthToken: () => apiClient.clearAuthToken(),
}
