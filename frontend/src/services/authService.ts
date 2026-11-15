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

/**
 * Authentication service encapsulating user session, login, signup, and logout.
 */
export const authService = {
  /**
   * Fetch current authenticated session user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>(API_ENDPOINTS.AUTH.CURRENT_USER);
    return response.data;
  },

  /**
   * Log in user with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  /**
   * Register a new user account
   */
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, credentials);
    return response.data;
  },

  /**
   * Log out user session
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.get<{ success: boolean; message?: string }>(
      API_ENDPOINTS.AUTH.LOGOUT
    );
    return response.data;
  },

  /**
   * Toggle a listing in the user's wishlist
   */
  async toggleWishlist(listingId: string): Promise<{ success: boolean; isFavorite: boolean; wishlist: string[]; message?: string }> {
    const response = await apiClient.post<{ success: boolean; isFavorite: boolean; wishlist: string[]; message?: string }>(
      API_ENDPOINTS.WISHLIST.TOGGLE(listingId)
    );
    return response.data;
  },

  /**
   * Get user's current wishlist
   */
  async getWishlist(): Promise<{ success: boolean; wishlist: any[] }> {
    const response = await apiClient.get<{ success: boolean; wishlist: any[] }>(
      API_ENDPOINTS.WISHLIST.GET
    );
    return response.data;
  },
};
