/**
 * Standard date formatting utility for Stay-Go
 * Formats dates into standard readable format: DD MMM YYYY (e.g. "24 Nov 2026")
 */

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats a date string (YYYY-MM-DD, ISO string, timestamp, or Date) to standard format (DD MMM YYYY).
 * Example: '2026-11-24' -> '24 Nov 2026'
 * Example: '2026-05-04' -> '04 May 2026'
 */
export function formatStandardDate(dateInput?: string | Date | number | null): string {
  if (!dateInput) return '';

  // Handle standard 'YYYY-MM-DD' without timezone shift artifacts
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number);
    const monthName = MONTH_NAMES[month - 1] || '';
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    return `${dayStr} ${monthName} ${year}`;
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = d.getDate();
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const monthName = MONTH_NAMES[d.getMonth()] || '';
  const year = d.getFullYear();

  return `${dayStr} ${monthName} ${year}`;
}

/**
 * Formats check-in and check-out dates into standard format (DD MMM YYYY – DD MMM YYYY).
 * Example: ('2026-11-24', '2026-11-25') -> '24 Nov 2026 – 25 Nov 2026'
 */
export function formatStandardDateRange(
  checkIn?: string | Date | null,
  checkOut?: string | Date | null
): string {
  const formattedIn = formatStandardDate(checkIn);
  const formattedOut = formatStandardDate(checkOut);

  if (formattedIn && formattedOut) {
    return `${formattedIn} – ${formattedOut}`;
  }
  if (formattedIn) return formattedIn;
  if (formattedOut) return formattedOut;
  return '';
}
