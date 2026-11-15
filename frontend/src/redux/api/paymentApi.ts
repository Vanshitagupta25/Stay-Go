import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../services/axiosBaseQuery";
import { API_ENDPOINTS } from "../../services/endpoints";

export interface CreateOrderRequest {
  listingId: string;
  checkIn: string;
  checkOut: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
  razorpayKeyId: string;
  pricing?: {
    nights: number;
    pricePerNight: number;
    basePrice: number;
    serviceFee: number;
    tax: number;
    totalRupees: number;
  };
}

export interface VerifySignatureRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}

export interface VerifySignatureResponse {
  success: boolean;
  message: string;
}

export interface CancelOrderRequest {
  bookingId: string;
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (bookingData) => ({
        url: API_ENDPOINTS.PAYMENT.CREATE_ORDER,
        method: "POST",
        data: bookingData,
      }),
    }),
    verifySignature: builder.mutation<VerifySignatureResponse, VerifySignatureRequest>({
      query: (paymentData) => ({
        url: API_ENDPOINTS.PAYMENT.VERIFY_SIGNATURE,
        method: "POST",
        data: paymentData,
      }),
    }),
    cancelOrder: builder.mutation<CancelOrderResponse, CancelOrderRequest>({
      query: (bookingData) => ({
        url: API_ENDPOINTS.PAYMENT.CANCEL_ORDER,
        method: "POST",
        data: bookingData,
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useVerifySignatureMutation,
  useCancelOrderMutation,
} = paymentApi;
