import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import {
  useCancelOrderMutation,
  useCreateOrderMutation,
  useVerifySignatureMutation,
} from "../redux/api/paymentApi";
import { calculateBookingPricing } from "../utils/pricing";
import { EASE_SUBTLE } from "../utils/motion";
import { getBookingButtonState } from "../utils/availability";

interface BookingProps {
  listingId: string;
  pricePerNight: number;
  maxGuests?: number;
  checkIn: string;
  checkOut: string;
  isUnavailable?: boolean;
  isAvailabilityLoading?: boolean;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  onAvailabilityRefresh?: () => void;
  onBookingConfirmed?: () => void;
}

export const BookingWidget: React.FC<BookingProps> = ({
  listingId,
  pricePerNight,
  maxGuests,
  checkIn,
  checkOut,
  isUnavailable = false,
  isAvailabilityLoading = false,
  onDatesChange,
  onAvailabilityRefresh,
  onBookingConfirmed,
}) => {
  const [guests, setGuests] = useState<number>(1);
  const [notice, setNotice] = useState<{ type: "error" | "success" | "info"; message: string } | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const guestLimit =
    typeof maxGuests === 'number' && Number.isFinite(maxGuests) && maxGuests > 0
      ? Math.floor(maxGuests)
      : 1;
  const selectedGuests = Math.min(guests, guestLimit);

  const [createOrder, { isLoading: isCreatingOrder, error: createOrderError, reset: resetCreateOrder }] = useCreateOrderMutation();
  const [verifySignature, { isLoading: isVerifying, error: verifyError, reset: resetVerify }] = useVerifySignatureMutation();
  const [cancelOrder] = useCancelOrderMutation();

  const isLoading = isCreatingOrder || isVerifying;
  const buttonState = getBookingButtonState({
    checkIn,
    checkOut,
    isChecking: isAvailabilityLoading && Boolean(checkIn && checkOut),
    isUnavailable,
    isProcessing: isLoading,
  });

  const calculateNights = (): number => {
    if (!checkIn || !checkOut) return 0;
    const [y1, m1, d1] = checkIn.split("-").map(Number);
    const [y2, m2, d2] = checkOut.split("-").map(Number);
    const dt1 = new Date(y1, m1 - 1, d1);
    const dt2 = new Date(y2, m2 - 1, d2);
    const diff = Math.round((dt2.getTime() - dt1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const pricing = calculateBookingPricing(pricePerNight, nights > 0 ? nights : 1);
  const baseTotal = nights > 0 ? pricing.basePrice : pricePerNight;
  const serviceFee = pricing.serviceFee;
  const applicableTaxes = pricing.tax;
  const grandTotal = pricing.totalRupees;

  const releasePendingHold = (bookingId?: string) => {
    if (!bookingId) {
      onAvailabilityRefresh?.();
      return;
    }

    cancelOrder({ bookingId })
      .unwrap()
      .catch(() => undefined)
      .finally(() => onAvailabilityRefresh?.());
  };

  const handlePayment = async () => {
    setNotice(null);
    resetCreateOrder();
    resetVerify();

    if (!checkIn || !checkOut) {
      setNotice({ type: "error", message: "Please select check-in and check-out dates." });
      return;
    }

    if (checkOut <= checkIn) {
      setNotice({ type: "error", message: "Check-out date must be after check-in date." });
      return;
    }

    if (isUnavailable) {
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setNotice({ type: "error", message: "Razorpay SDK failed to load. Please check your connection and try again." });
        return;
      }

      const orderData = await createOrder({ listingId, checkIn, checkOut }).unwrap();

      const options = {
        key: orderData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Stay-Go",
        description: "Booking Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await verifySignature({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }).unwrap();

            if (verifyRes.success) {
              onBookingConfirmed?.();
              onAvailabilityRefresh?.();
              setNotice({ type: "success", message: "Booking confirmed! Payment successful." });
            } else {
              setNotice({ type: "error", message: "Payment verification failed. Please contact support if amount was deducted." });
            }
          } catch (err: any) {
            console.error("Verification failed:", err);
            onAvailabilityRefresh?.();
            setNotice({ type: "error", message: err?.data?.message || "Payment verification failed." });
          }
        },
        prefill: {
          name: "Guest User",
          email: "guest@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#fe424d",
        },
        modal: {
          ondismiss: function () {
            releasePendingHold(orderData.bookingId);
            setNotice({ type: "info", message: "Payment was cancelled before completion." });
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);

      paymentObject.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        releasePendingHold(orderData.bookingId);
        setNotice({ type: "error", message: "Payment failed: " + (response?.error?.description || "Please try again.") });
      });

      paymentObject.open();
    } catch (err: any) {
      console.error("Order creation failed:", err);
      if (err?.status === 409) {
        onAvailabilityRefresh?.();
      }
      setNotice({ type: "error", message: err?.data?.message || "Error initiating payment. Please try again." });
    }
  };

  const errorMessage =
    notice?.type === "error"
      ? notice.message
      : (createOrderError as any)?.data?.message || (verifyError as any)?.data?.message;
  const successMessage = notice?.type === "success" ? notice.message : null;
  const infoMessage = notice?.type === "info" ? notice.message : null;

  const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            {errorMessage}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"
          >
            {successMessage}
          </motion.div>
        )}
        {infoMessage && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700"
          >
            {infoMessage}
          </motion.div>
        )}
      </AnimatePresence>

      
      <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white transition focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/10">
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="border-r border-gray-300 p-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Check-in
            </label>
            <input
              type="date"
              min={todayStr}
              value={checkIn}
              onChange={(e) => onDatesChange(e.target.value, checkOut)}
              className="mt-0.5 w-full cursor-pointer bg-transparent text-xs font-medium text-gray-800 focus:outline-none"
            />
          </div>
          <div className="p-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Checkout
            </label>
            <input
              type="date"
              min={checkIn || todayStr}
              value={checkOut}
              onChange={(e) => onDatesChange(checkIn, e.target.value)}
              className="mt-0.5 w-full cursor-pointer bg-transparent text-xs font-medium text-gray-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-2.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
            Guests
          </label>
          <select
            value={selectedGuests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-0.5 w-full cursor-pointer bg-transparent text-xs font-medium text-gray-800 focus:outline-none"
          >
            {Array.from({ length: guestLimit }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isUnavailable && !isLoading && (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          These dates are already booked. Please choose different dates.
        </p>
      )}

      <motion.button
        onClick={handlePayment}
        disabled={buttonState.disabled}
        whileHover={prefersReducedMotion || buttonState.disabled ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion || buttonState.disabled ? undefined : { scale: 0.99 }}
        className="w-full cursor-pointer rounded-2xl bg-[#fe424d] py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_-12px_rgba(254,66,77,0.9)] transition hover:bg-[#e03a45] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonState.label}
      </motion.button>

      
      <AnimatePresence initial={false}>
        {nights > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_SUBTLE }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span className="underline decoration-gray-300">
                  ₹{pricePerNight.toLocaleString("en-IN")} × {nights} {nights === 1 ? "night" : "nights"}
                </span>
                <span>₹{baseTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="underline decoration-gray-300">Stay-Go service fee (12%)</span>
                <span>₹{serviceFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="underline decoration-gray-300">Applicable taxes (18% GST)</span>
                <span>₹{applicableTaxes.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                <span>Total booking amount</span>
                <span className="text-[#fe424d]">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
