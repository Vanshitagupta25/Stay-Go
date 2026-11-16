import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: any;
}

export const authService = {
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>(API_ENDPOINTS.AUTH.CURRENT_USER);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, credentials);
    return response.data;
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.get<{ success: boolean; message?: string }>(
      API_ENDPOINTS.AUTH.LOGOUT
    );
    return response.data;
  },

  async toggleWishlist(listingId: string): Promise<{ success: boolean; isFavorite: boolean; wishlist: string[]; message?: string }> {
    const response = await apiClient.post<{ success: boolean; isFavorite: boolean; wishlist: string[]; message?: string }>(
      API_ENDPOINTS.WISHLIST.TOGGLE(listingId)
    );
    return response.data;
  },

  async getWishlist(): Promise<{ success: boolean; wishlist: any[] }> {
    const response = await apiClient.get<{ success: boolean; wishlist: any[] }>(
      API_ENDPOINTS.WISHLIST.GET
    );
    return response.data;
  },
};
