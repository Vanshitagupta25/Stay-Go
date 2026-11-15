import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { Listing } from '../types/listing';

export interface ListingFilterParams {
  category?: string;
  city?: string;
  sort?: string;
  page?: number;
  limit?: number;
  checkIn?: string;
  checkOut?: string;
}

export interface GetListingsApiResponse {
  success: boolean;
  listings: Listing[];
  totalListings?: number;
  totalPages?: number;
  currentPage?: number;
  category?: string;
  city?: string;
  sort?: string;
  limit?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface CreateListingInput {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  country?: string;
  category?: string;
}

/**
 * Listings service encapsulating browsing, fetching, creating, and deleting listings.
 */
export const listingService = {
  /**
   * Fetch paginated listings with optional filters (category, city, sort, page, limit)
   */
  async getListings(params?: ListingFilterParams): Promise<GetListingsApiResponse> {
    const response = await apiClient.get<GetListingsApiResponse>(API_ENDPOINTS.LISTINGS.BASE, {
      params,
    });
    return response.data;
  },

  /**
   * Fetch a single listing by its ID
   */
  async getListingById(id: string): Promise<{ success: boolean; listing: any }> {
    const response = await apiClient.get<{ success: boolean; listing: any }>(
      API_ENDPOINTS.LISTINGS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create a new listing with multipart/form-data support
   */
  async createListing(
    input: CreateListingInput,
    imageFile?: File | null
  ): Promise<{ success: boolean; message?: string; listing?: any }> {
    const formData = new FormData();
    formData.append('listing[title]', input.title || '');
    formData.append('listing[description]', input.description || '');
    formData.append('listing[price]', String(input.price || 0));
    formData.append('listing[location]', input.location || '');
    formData.append('listing[country]', input.country || '');
    formData.append('listing[category]', input.category || '');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await apiClient.post(API_ENDPOINTS.LISTINGS.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a listing by ID
   */
  async deleteListing(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.LISTINGS.BY_ID(id)
    );
    return response.data;
  },
};
