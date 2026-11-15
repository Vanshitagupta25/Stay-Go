import React, { useState } from "react";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { useCreateOrderMutation, useVerifySignatureMutation } from "../redux/api/paymentApi";
import { calculateBookingPricing } from "../utils/pricing";

interface BookingProps {
  listingId: string;
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
}

export const BookingWidget: React.FC<BookingProps> = ({
  listingId,
  pricePerNight,
  checkIn,
  checkOut,
  onDatesChange,
}) => {
  const [guests, setGuests] = useState<number>(1);

  // RTK Query hooks for state, loading, and error handling
  const [createOrder, { isLoading: isCreatingOrder, error: createOrderError }] = useCreateOrderMutation();
  const [verifySignature, { isLoading: isVerifying, error: verifyError }] = useVerifySignatureMutation();

  const isLoading = isCreatingOrder || isVerifying;

  // Calculate nights
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

  const handlePayment = async () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates on the calendar.");
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      // 1. Create order via RTK Query mutation
      const orderData = await createOrder({ listingId, checkIn, checkOut }).unwrap();

      // 2. Razorpay Options
      const options = {
        key: orderData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Stay-Go",
        description: "Booking Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature via RTK Query mutation
            const verifyRes = await verifySignature({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }).unwrap();

            if (verifyRes.success) {
              alert("Booking confirmed! Payment successful.");
            }
          } catch (err: any) {
            console.error("Verification failed:", err);
            alert(err?.data?.message || "Payment verification failed!");
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
            alert("Payment was cancelled or closed before completion.");
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);

      paymentObject.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
      });

      paymentObject.open();
    } catch (err: any) {
      console.error("Order creation failed:", err);
      alert(err?.data?.message || "Error initiating payment.");
    }
  };

  const errorMessage =
    (createOrderError as any)?.data?.message ||
    (verifyError as any)?.data?.message;

  const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Airbnb style Check-in / Checkout / Guests box */}
      <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 transition bg-white">
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="p-2.5 border-r border-gray-300">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700">
              Check-in
            </label>
            <input
              type="date"
              min={todayStr}
              value={checkIn}
              onChange={(e) => onDatesChange(e.target.value, checkOut)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer mt-0.5"
            />
          </div>
          <div className="p-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700">
              Checkout
            </label>
            <input
              type="date"
              min={checkIn || todayStr}
              value={checkOut}
              onChange={(e) => onDatesChange(checkIn, e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer mt-0.5"
            />
          </div>
        </div>

        <div className="p-2.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer mt-0.5"
          >
            <option value={1}>1 guest</option>
            <option value={2}>2 guests</option>
            <option value={3}>3 guests</option>
            <option value={4}>4 guests</option>
          </select>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-[#fe424d] hover:bg-[#e03a45] text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-md text-base"
      >
        {isLoading ? "Processing..." : (!checkIn || !checkOut ? "Check availability" : "Reserve & Pay")}
      </button>

      {/* Pricing breakdown if dates are selected */}
      {nights > 0 && (
        <div className="space-y-3 pt-3 border-t border-gray-100 text-sm">
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
          <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-200 text-base">
            <span>Total booking amount</span>
            <span className="text-[#fe424d]">₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  );
};
