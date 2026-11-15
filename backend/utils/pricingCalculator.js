/**
 * Unified Pricing Calculation Utility for Stay-Go bookings.
 * Calculates nightly accommodation, service fee, and applicable taxes.
 */

const SERVICE_FEE_RATE = 0.12; // 12% Stay-Go platform service fee
const TAX_RATE = 0.18; // 18% Applicable GST / taxes

function calculateBookingPrice({ pricePerNight, numberOfNights }) {
  const safeNights = Number(numberOfNights) > 0 ? Math.round(Number(numberOfNights)) : 1;
  const safePrice = Number(pricePerNight) > 0 ? Number(pricePerNight) : 0;

  const basePrice = Math.round(safePrice * safeNights);
  const serviceFee = Math.round(basePrice * SERVICE_FEE_RATE);
  const tax = Math.round((basePrice + serviceFee) * TAX_RATE);
  const totalRupees = basePrice + serviceFee + tax;
  const totalPaise = totalRupees * 100;

  return {
    nights: safeNights,
    pricePerNight: safePrice,
    basePrice,
    serviceFee,
    tax,
    totalRupees,
    totalPaise,
  };
}

module.exports = {
  SERVICE_FEE_RATE,
  TAX_RATE,
  calculateBookingPrice,
};

