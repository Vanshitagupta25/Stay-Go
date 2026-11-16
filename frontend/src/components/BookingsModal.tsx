import React, { useEffect, useState } from 'react';
import { X, CalendarCheck, Compass, Loader2, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { paymentService } from '../services';
import { ModalPortal } from './ModalPortal';

export interface BookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectListing?: (listing: any) => void;
}

export const BookingsModal: React.FC<BookingsModalProps> = ({
  isOpen,
  onClose,
  onSelectListing,
}) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    paymentService
      .getMyBookings()
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.bookings)) {
          setBookings(res.bookings);
        } else {
          setBookings([]);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load bookings.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateNights = (inDate: string, outDate: string) => {
    try {
      const start = new Date(inDate).getTime();
      const end = new Date(outDate).getTime();
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 1;
    } catch {
      return 1;
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookings-modal-title"
      >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        
        
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="bookings-modal-title" className="text-lg font-bold text-gray-900">
                My Bookings
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {bookings.length} {bookings.length === 1 ? 'reservation' : 'reservations'} found
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/40">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-medium">Loading your bookings...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16 bg-red-50/50 rounded-2xl border border-red-100 p-6">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 text-xs font-bold text-gray-600 hover:underline"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-150">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No bookings yet</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                You haven't made any reservations yet. Find your next dream stay and your bookings will appear here!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-2 bg-[#fe424d] hover:bg-[#e03a45] text-white px-6 py-2.5 rounded-full text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Stays</span>
              </button>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => {
                const listing = booking.listing || {};
                const nights = calculateNights(booking.checkIn, booking.checkOut);
                const displayAmount = booking.totalAmount
                  ? Math.round(booking.totalAmount / 100).toLocaleString('en-IN')
                  : '0';

                return (
                  <div
                    key={booking._id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        {listing.image?.url ? (
                          <img
                            src={listing.image.url}
                            alt={listing.title || 'Stay'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-medium text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              booking.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : booking.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.status === 'PAID' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {booking.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
                            {booking.status === 'FAILED' && <AlertCircle className="w-3 h-3 text-red-600" />}
                            {booking.status === 'PAID' ? 'Confirmed' : booking.status}
                          </span>

                          <span className="text-[11px] text-gray-400">
                            Booked on {formatDate(booking.createdAt)}
                          </span>
                        </div>

                        <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {listing.title || 'Reserved Stay'}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mb-2">
                          {listing.location ? `${listing.location}, ${listing.country || ''}` : 'Stay Destination'}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
                          <span>{formatDate(booking.checkIn)}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(booking.checkOut)}</span>
                          <span className="text-gray-400 font-normal">({nights} {nights === 1 ? 'night' : 'nights'})</span>
                        </div>
                      </div>
                    </div>

                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0 gap-2">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-gray-400">Total Paid</div>
                        <div className="text-base sm:text-lg font-extrabold text-gray-900">
                          ₹{displayAmount}
                        </div>
                      </div>

                      {listing._id && onSelectListing && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectListing(listing);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#fe424d] hover:text-[#e03a45] bg-rose-50 hover:bg-rose-100/80 px-3.5 py-1.5 rounded-full transition cursor-pointer"
                        >
                          <span>View Stay</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end bg-gray-50/60">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-200/50 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
      </div>
    </ModalPortal>
  );
};
