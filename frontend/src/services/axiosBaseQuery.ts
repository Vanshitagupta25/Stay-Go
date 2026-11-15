import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';
import { apiClient, ApiError } from './apiClient';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  body?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
}

/**
 * Custom BaseQuery function for RTK Query that routes all requests
 * through the centralized common Axios instance.
 */
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, { status?: number; data?: any; message: string }> =>
  async ({ url, method = 'GET', data, body, params, headers }) => {
    try {
      const result = await apiClient({
        url,
        method,
        data: data ?? body,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      if (axiosError instanceof ApiError) {
        return {
          error: {
            status: axiosError.status,
            data: axiosError.data,
            message: axiosError.message,
          },
        };
      }
      const err = axiosError as any;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message || 'Network request failed',
        },
      };
    }
  };
