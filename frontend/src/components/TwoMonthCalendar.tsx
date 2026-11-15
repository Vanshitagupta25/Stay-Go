import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatStandardDate } from '../utils/dateFormatter';

interface TwoMonthCalendarProps {
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  locationName?: string;
  compact?: boolean;
}

export const TwoMonthCalendar: React.FC<TwoMonthCalendarProps> = ({
  checkIn,
  checkOut,
  onDatesChange,
  locationName,
  compact = false,
}) => {
  const today = React.useMemo(() => new Date(), []);
  // Anchor to 1st of current month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() =>
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const nextMonthDate = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth() + 1,
    1
  );

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const toISODate = (d: Date): string => {
    return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
  };

  const todayStr = toISODate(today);

  const isPrevDisabled =
    currentMonthDate.getFullYear() === today.getFullYear() &&
    currentMonthDate.getMonth() === today.getMonth();

  const handlePrevMonth = () => {
    if (isPrevDisabled) return;
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (dateStr: string) => {
    if (dateStr < todayStr) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Start a new selection
      onDatesChange(dateStr, '');
    } else if (checkIn && !checkOut) {
      if (dateStr < checkIn) {
        // Clicked an earlier date, make it new checkIn
        onDatesChange(dateStr, '');
      } else if (dateStr === checkIn) {
        // Deselect
        onDatesChange('', '');
      } else {
        // Complete range
        onDatesChange(checkIn, dateStr);
      }
    }
  };

  // Helper to calculate total nights
  const calculateNights = (): number => {
    if (!checkIn || !checkOut) return 0;
    const [y1, m1, d1] = checkIn.split('-').map(Number);
    const [y2, m2, d2] = checkOut.split('-').map(Number);
    const dt1 = new Date(y1, m1 - 1, d1);
    const dt2 = new Date(y2, m2 - 1, d2);
    const diff = Math.round((dt2.getTime() - dt1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const formatHeaderDate = (isoStr: string) => formatStandardDate(isoStr);

  const nights = calculateNights();

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const renderMonth = (monthDate: Date, isLeft: boolean) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthName = monthDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array.from({ length: firstDayIndex });
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className={`flex-1 ${compact ? 'min-w-[210px] sm:min-w-[230px]' : 'min-w-[280px]'}`}>
        {/* Month Header */}
        <div className={`flex items-center justify-between ${compact ? 'mb-2 h-7' : 'mb-4 h-9'}`}>
          {isLeft ? (
            <button
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              aria-label="Previous month"
              className={`p-1 rounded-full hover:bg-gray-100 transition ${
                isPrevDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
              }`}
            >
              <ChevronLeft className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            </button>
          ) : (
            <div className={compact ? 'w-6' : 'w-8'} />
          )}

          <h4 className={compact ? 'text-xs sm:text-sm font-bold text-gray-900' : 'text-base font-semibold text-gray-900'}>
            {monthName}
          </h4>

          {!isLeft ? (
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 rounded-full hover:bg-gray-100 transition text-gray-700 cursor-pointer"
            >
              <ChevronRight className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            </button>
          ) : (
            <div className={compact ? 'w-6' : 'w-8'} />
          )}
        </div>

        {/* Days of week */}
        <div className={`grid grid-cols-7 text-center ${compact ? 'mb-1 text-[11px]' : 'mb-2 text-xs'} font-semibold text-gray-400`}>
          {daysOfWeek.map((d, idx) => (
            <div key={idx} className={compact ? 'py-0.5' : 'py-1'}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-0.5 text-center">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className={compact ? 'h-8' : 'h-10'} />
          ))}

          {dayNumbers.map((day) => {
            const dateStr = `${year}-${padZero(month + 1)}-${padZero(day)}`;
            const isPast = dateStr < todayStr;
            const isCheckIn = dateStr === checkIn;
            const isCheckOut = dateStr === checkOut;

            const isSelectedRange =
              checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

            const isHoverRange =
              checkIn &&
              !checkOut &&
              hoveredDate &&
              hoveredDate > checkIn &&
              dateStr > checkIn &&
              dateStr <= hoveredDate;

            const isInRange = isSelectedRange || isHoverRange;

            return (
              <div
                key={dateStr}
                className={`relative ${compact ? 'h-8' : 'h-10'} flex items-center justify-center ${
                  isInRange ? 'bg-gray-100' : ''
                } ${
                  isCheckIn && (checkOut || (hoveredDate && hoveredDate > checkIn))
                    ? 'rounded-l-full bg-gradient-to-r from-transparent to-gray-100'
                    : ''
                } ${
                  isCheckOut ? 'rounded-r-full bg-gradient-to-l from-transparent to-gray-100' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleDateClick(dateStr)}
                  onMouseEnter={() => !isPast && setHoveredDate(dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={isPast}
                  className={`relative z-10 ${
                    compact ? 'w-7.5 h-7.5 text-xs' : 'w-9 h-9 text-sm'
                  } rounded-full flex items-center justify-center font-medium transition ${
                    isPast
                      ? 'text-gray-300 line-through cursor-not-allowed'
                      : isCheckIn || isCheckOut
                      ? 'bg-gray-900 text-white font-semibold shadow-2xs'
                      : isInRange
                      ? 'text-gray-900 font-semibold hover:border hover:border-gray-900 hover:bg-white'
                      : 'text-gray-800 hover:border hover:border-gray-900 hover:bg-white cursor-pointer'
                  }`}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={compact ? 'w-full' : 'pb-8 border-b border-gray-200'}>
      {/* Calendar Header with Title & Clear Dates button */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              {nights > 0
                ? `${nights} ${nights === 1 ? 'night' : 'nights'} in ${
                    locationName || 'Stay-Go'
                  }`
                : checkIn
                ? 'Select checkout date'
                : 'Select check-in date'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {nights > 0
                ? `${formatHeaderDate(checkIn)} – ${formatHeaderDate(checkOut)}`
                : checkIn
                ? 'Minimum stay: 1 night'
                : 'Add your travel dates for exact pricing'}
            </p>
          </div>

          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={() => onDatesChange('', '')}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-4 cursor-pointer py-1 self-start sm:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              Clear dates
            </button>
          )}
        </div>
      )}

      {/* Two Month Calendars Side-by-Side */}
      <div className={`flex flex-col sm:flex-row ${compact ? 'gap-4 sm:gap-6' : 'gap-8 lg:gap-12 bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs'}`}>
        {renderMonth(currentMonthDate, true)}
        {renderMonth(nextMonthDate, false)}
      </div>

      {!compact && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 px-1">
          <span>Prices may vary depending on dates</span>
          {(checkIn || checkOut) && (
            <span className="font-medium text-gray-600">
              {checkIn ? `Check-in: ${formatHeaderDate(checkIn)}` : ''}
              {checkOut ? ` • Checkout: ${formatHeaderDate(checkOut)}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
