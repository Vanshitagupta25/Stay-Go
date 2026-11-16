import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { Listing } from '../types/listing';
import { buildListingFormData } from '../utils/listingPayload';

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
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  amenities?: string[];
}

export const listingService = {
  async getListings(params?: ListingFilterParams): Promise<GetListingsApiResponse> {
    const response = await apiClient.get<GetListingsApiResponse>(API_ENDPOINTS.LISTINGS.BASE, {
      params,
    });
    return response.data;
  },

  async getListingById(id: string): Promise<{ success: boolean; listing: any }> {
    const response = await apiClient.get<{ success: boolean; listing: any }>(
      API_ENDPOINTS.LISTINGS.BY_ID(id)
    );
    return response.data;
  },

  async createListing(
    input: CreateListingInput,
    imageFile?: File | null
  ): Promise<{ success: boolean; message?: string; listing?: any }> {
    const formData = buildListingFormData(input, imageFile);

    const response = await apiClient.post(API_ENDPOINTS.LISTINGS.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteListing(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.LISTINGS.BY_ID(id)
    );
    return response.data;
  },
};
