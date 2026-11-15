import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface CreateOrderPayload {
  listingId: string;
  checkIn: string;
  checkOut: string;
}

export interface CreateOrderResult {
  success: boolean;
  message: string;
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
  razorpayKeyId: string;
}

export interface VerifySignaturePayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}

export interface VerifySignatureResult {
  success: boolean;
  message: string;
}

/**
 * Payment service encapsulating Razorpay order creation and verification.
 */
export const paymentService = {
  /**
   * Create Razorpay order on backend
   */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    const response = await apiClient.post<CreateOrderResult>(
      API_ENDPOINTS.PAYMENT.CREATE_ORDER,
      payload
    );
    return response.data;
  },

  /**
   * Verify Razorpay payment signature
   */
  async verifySignature(payload: VerifySignaturePayload): Promise<VerifySignatureResult> {
    const response = await apiClient.post<VerifySignatureResult>(
      API_ENDPOINTS.PAYMENT.VERIFY_SIGNATURE,
      payload
    );
    return response.data;
  },

  /**
   * Fetch current authenticated user's bookings
   */
  async getMyBookings(): Promise<{ success: boolean; bookings: any[] }> {
    const response = await apiClient.get<{ success: boolean; bookings: any[] }>(
      API_ENDPOINTS.PAYMENT.MY_BOOKINGS
    );
    return response.data;
  },
};
