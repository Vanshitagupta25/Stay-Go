export const SERVICE_FEE_RATE = 0.12; // 12% Stay-Go platform service fee
export const TAX_RATE = 0.18; // 18% Applicable GST / taxes

export interface PricingBreakdown {
  nights: number;
  pricePerNight: number;
  basePrice: number;
  serviceFee: number;
  tax: number;
  totalRupees: number;
  totalPaise: number;
}

export function calculateBookingPricing(pricePerNight: number, numberOfNights: number): PricingBreakdown {
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

