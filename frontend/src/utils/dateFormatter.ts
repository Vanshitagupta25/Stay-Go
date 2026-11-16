
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatStandardDate(dateInput?: string | Date | number | null): string {
  if (!dateInput) return '';

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
