const DAY_MS = 24 * 60 * 60 * 1000;
const HOLD_DURATION_MS = 15 * 60 * 1000;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function parseDateOnly(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(`${formatDateOnly(value)}T00:00:00.000Z`);
  }

  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || formatDateOnly(parsed) !== value) {
    return null;
  }

  return parsed;
}

function buildOccupiedDates(checkIn, checkOut) {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);

  if (!start || !end || start >= end) return [];

  const dates = [];
  for (let cursor = start.getTime(); cursor < end.getTime(); cursor += DAY_MS) {
    dates.push(formatDateOnly(new Date(cursor)));
  }
  return dates;
}

function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  if (!firstStart || !firstEnd || !secondStart || !secondEnd) return false;
  return firstStart < secondEnd && firstEnd > secondStart;
}

function buildActiveBookingFilter(now = new Date()) {
  return {
    $or: [
      { status: "PAID" },
      { status: "PENDING", holdExpiresAt: { $gt: now } },
    ],
  };
}

function serializeBookedRanges(bookings) {
  return (bookings || [])
    .map((booking) => ({
      checkIn: formatDateOnly(new Date(booking.checkIn)),
      checkOut: formatDateOnly(new Date(booking.checkOut)),
    }))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
}

function flattenBookedDates(bookings) {
  const dates = new Set();
  for (const booking of bookings || []) {
    for (const date of buildOccupiedDates(booking.checkIn, booking.checkOut)) {
      dates.add(date);
    }
  }
  return Array.from(dates).sort();
}

module.exports = {
  DAY_MS,
  HOLD_DURATION_MS,
  parseDateOnly,
  formatDateOnly,
  buildOccupiedDates,
  rangesOverlap,
  buildActiveBookingFilter,
  serializeBookedRanges,
  flattenBookedDates,
};
