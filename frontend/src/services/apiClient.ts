import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * Normalizes the API base URL so that it consistently ends with /api
 * and avoids trailing slashes or duplicate paths.
 */
export const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Common centralized Axios instance with default configurations.
 */
export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If payload is FormData, let the browser/axios set the multipart boundary automatically
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    // Extract human-friendly error message from server response or fallback
    let message =
      responseData?.message ||
      (typeof responseData === 'string' ? responseData : null) ||
      error.message ||
      'An unexpected network error occurred.';

    if (status === 401) {
      // Unauthorized: user session expired or unauthenticated
      message = responseData?.message || 'Please log in to continue.';
    } else if (status === 403) {
      message = responseData?.message || 'You do not have permission to perform this action.';
    } else if (status === 404) {
      message = responseData?.message || 'Requested resource was not found.';
    } else if (status && status >= 500) {
      message = responseData?.message || 'Internal server error. Please try again later.';
    }

    const normalizedError = new ApiError(message, status, responseData);
    return Promise.reject(normalizedError);
  }
);

export default apiClient;
