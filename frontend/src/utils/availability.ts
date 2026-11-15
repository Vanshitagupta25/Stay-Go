export interface BookingButtonStateInput {
  checkIn: string;
  checkOut: string;
  isChecking: boolean;
  isUnavailable: boolean;
  isProcessing: boolean;
}

export interface BookingButtonState {
  label: string;
  disabled: boolean;
}

export function isRangeBooked(
  checkIn: string,
  checkOut: string,
  bookedDates: readonly string[]
): boolean {
  if (!checkIn || !checkOut || checkIn >= checkOut) return false;
  return bookedDates.some((date) => date >= checkIn && date < checkOut);
}

export function rangesOverlap(
  firstCheckIn: string,
  firstCheckOut: string,
  secondCheckIn: string,
  secondCheckOut: string
): boolean {
  if (
    !firstCheckIn ||
    !firstCheckOut ||
    !secondCheckIn ||
    !secondCheckOut ||
    firstCheckIn >= firstCheckOut ||
    secondCheckIn >= secondCheckOut
  ) {
    return false;
  }

  return firstCheckIn < secondCheckOut && firstCheckOut > secondCheckIn;
}

export function isNightBooked(date: string, bookedDates: readonly string[]): boolean {
  return bookedDates.includes(date);
}

export function getBookingButtonState({
  checkIn,
  checkOut,
  isChecking,
  isUnavailable,
  isProcessing,
}: BookingButtonStateInput): BookingButtonState {
  if (isProcessing) {
    return { label: 'Processing...', disabled: true };
  }

  if (!checkIn || !checkOut) {
    return { label: 'Check availability', disabled: false };
  }

  if (isChecking) {
    return { label: 'Checking availability...', disabled: true };
  }

  if (isUnavailable) {
    return { label: 'Booked', disabled: true };
  }

  return { label: 'Reserve & Pay', disabled: false };
}
