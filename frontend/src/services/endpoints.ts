/**
 * Centralized API Endpoints organized by feature.
 * All paths are relative to the configured API base URL (which points to /api).
 */
export const API_ENDPOINTS = {
  AUTH: {
    CURRENT_USER: '/curr-user',
    LOGIN: '/login',
    SIGNUP: '/signup',
    LOGOUT: '/logout',
  },
  LISTINGS: {
    BASE: '/listings',
    BY_ID: (id: string) => `/listings/${id}`,
    AVAILABILITY: (id: string) => `/listings/${id}/availability`,
  },
  REVIEWS: {
    BASE: (listingId: string) => `/listings/${listingId}/reviews`,
    BY_ID: (listingId: string, reviewId: string) => `/listings/${listingId}/reviews/${reviewId}`,
  },
  PAYMENT: {
    CREATE_ORDER: '/payment/create-order',
    VERIFY_SIGNATURE: '/payment/verify-signature',
    CANCEL_ORDER: '/payment/cancel-order',
    MY_BOOKINGS: '/payment/my-bookings',
  },
  WISHLIST: {
    TOGGLE: (listingId: string) => `/wishlist/${listingId}`,
    GET: '/wishlist',
  },
} as const;
