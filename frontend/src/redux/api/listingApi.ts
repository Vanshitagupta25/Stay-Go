import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../services/axiosBaseQuery";
import { API_ENDPOINTS } from "../../services/endpoints";
import type { Listing } from "../../types/listing";

export interface GetListingsResponse {
  success: boolean;
  listings: Listing[];
  category?: string;
  city?: string;
  sort?: string;
  currentPage?: number;
  totalPages?: number;
  totalListings?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export const listingApi = createApi({
  reducerPath: "listingApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Listings", "Listing"],
  endpoints: (builder) => ({
    getListings: builder.query<
      GetListingsResponse,
      {
        category?: string;
        city?: string;
        sort?: string;
        page?: number;
        limit?: number;
        checkIn?: string;
        checkOut?: string;
        guests?: number;
      } | void
    >({
      query: (params) => ({
        url: API_ENDPOINTS.LISTINGS.BASE,
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Listings"],
    }),
    getListingById: builder.query<any, string>({
      query: (id) => ({
        url: API_ENDPOINTS.LISTINGS.BY_ID(id),
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Listing", id }],
    }),
    addReview: builder.mutation<
      any,
      { listingId: string; rating: number; comment: string }
    >({
      query: ({ listingId, rating, comment }) => ({
        url: API_ENDPOINTS.REVIEWS.BASE(listingId),
        method: "POST",
        data: {
          review: { rating, comment },
        },
      }),
      invalidatesTags: (_result, _error, { listingId }) => [
        { type: "Listing", id: listingId },
        "Listings",
      ],
    }),
    deleteReview: builder.mutation<
      any,
      { listingId: string; reviewId: string }
    >({
      query: ({ listingId, reviewId }) => ({
        url: API_ENDPOINTS.REVIEWS.BY_ID(listingId, reviewId),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { listingId }) => [
        { type: "Listing", id: listingId },
        "Listings",
      ],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useGetListingByIdQuery,
  useAddReviewMutation,
  useDeleteReviewMutation,
} = listingApi;
