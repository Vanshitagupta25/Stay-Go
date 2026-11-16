import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

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

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    let message =
      responseData?.message ||
      (typeof responseData === 'string' ? responseData : null) ||
      error.message ||
      'An unexpected network error occurred.';

    if (status === 401) {
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
