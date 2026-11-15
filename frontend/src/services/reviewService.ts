import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface CreateReviewInput {
  rating: number;
  comment: string;
}

/**
 * Reviews service encapsulating creating and deleting reviews.
 */
export const reviewService = {
  /**
   * Submit a review for a specific listing
   */
  async addReview(
    listingId: string,
    input: CreateReviewInput
  ): Promise<{ success: boolean; message?: string; review?: any }> {
    const response = await apiClient.post<{ success: boolean; message?: string; review?: any }>(
      API_ENDPOINTS.REVIEWS.BASE(listingId),
      {
        review: input,
      }
    );
    return response.data;
  },

  /**
   * Delete a review for a specific listing
   */
  async deleteReview(
    listingId: string,
    reviewId: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.REVIEWS.BY_ID(listingId, reviewId)
    );
    return response.data;
  },
};
