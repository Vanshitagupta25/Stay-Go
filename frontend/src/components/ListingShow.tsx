import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  useGetListingByIdQuery,
  useGetListingAvailabilityQuery,
  useAddReviewMutation,
  useDeleteReviewMutation,
} from '../redux/api/listingApi';
import { BookingWidget } from './BookingWidget';
import { ListingGallery } from './ListingGallery';
import { TwoMonthCalendar } from './TwoMonthCalendar';
import { StayAmenities } from './StayAmenities';
import { Reveal } from './Reveal';
import { formatCapacitySummary } from '../utils/capacity';
import { isRangeBooked, rangesOverlap } from '../utils/availability';
import { ArrowLeft, Star, MapPin, Trash2, Send, MessageSquare, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ListingShowProps {
  listingId: string;
  initialListing?: any;
  currentUser?: any;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onOpenAuthModal?: (mode: 'login' | 'signup') => void;
  heroImagePosition?: React.CSSProperties['objectPosition'];
  onClose: () => void;
}

export const ListingShow: React.FC<ListingShowProps> = ({
  listingId,
  initialListing,
  currentUser,
  isFavorite = false,
  onToggleFavorite,
  onOpenAuthModal,
  heroImagePosition = 'center',
  onClose,
}) => {
  const { data, isLoading } = useGetListingByIdQuery(listingId);
  const {
    data: availabilityData,
    isFetching: isAvailabilityFetching,
    refetch: refetchAvailability,
  } = useGetListingAvailabilityQuery(
    { listingId },
    { refetchOnMountOrArgChange: true }
  );
  const [addReview, { isLoading: isSubmittingReview }] = useAddReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const prefersReducedMotion = useReducedMotion();

  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [confirmedRange, setConfirmedRange] = useState<{
    checkIn: string;
    checkOut: string;
  } | null>(null);

  const bookedDates = availabilityData?.bookedDates || [];
  const isRangeUnavailable = Boolean(
    checkIn &&
      checkOut &&
      (isRangeBooked(checkIn, checkOut, bookedDates) ||
        (confirmedRange &&
          rangesOverlap(
            checkIn,
            checkOut,
            confirmedRange.checkIn,
            confirmedRange.checkOut
          )))
  );

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string>('');

  const listing = data?.listing || initialListing;
  const ownerName = listing?.owner?.username || 'Guest Host';

  const reviewsList = listing?.reviews || [];
  const totalReviews = reviewsList.length;
  const avgRating = totalReviews > 0
    ? (reviewsList.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(2)
    : null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError("Please write a comment describing your experience.");
      return;
    }

    try {
      setReviewError('');
      await addReview({
        listingId: listing._id,
        rating,
        comment: comment.trim(),
      }).unwrap();

      setComment('');
      setRating(5);
      setReviewSuccess("Your review has been submitted successfully!");
      setTimeout(() => setReviewSuccess(''), 4000);
    } catch (err: any) {
      setReviewError(err?.data?.message || "Failed to submit review. Please try again.");
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setReviewError('');
      await deleteReview({ listingId: listing._id, reviewId }).unwrap();
    } catch (err: any) {
      setReviewError(err?.data?.message || "Failed to delete review.");
    }
  };

  const ratingDescriptions: { [key: number]: string } = {
    1: '1 - Poor',
    2: '2 - Fair',
    3: '3 - Good',
    4: '4 - Very Good',
    5: '5 - Excellent',
  };

  if (isLoading && !listing) {
    return (
      <div className="min-h-screen bg-[#faf9f7] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="stay-skeleton mb-6 h-5 w-40 rounded-full" />
          <div className="stay-skeleton mb-6 h-10 w-2/3 rounded-2xl" />
          <div className="stay-skeleton mb-8 aspect-[4/3] w-full rounded-3xl lg:aspect-[16/9]" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="stay-skeleton h-24 rounded-2xl" />
              <div className="stay-skeleton h-64 rounded-2xl" />
            </div>
            <div className="stay-skeleton h-80 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-[#faf9f7]">
        <p className="text-xl font-semibold text-gray-700">Failed to load listing.</p>
        <button
          onClick={onClose}
          className="rounded-full bg-[#fe424d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e03a45]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const capacitySummary = formatCapacitySummary(listing);

  return (
    <div className="min-h-screen bg-[#faf9f7] text-gray-900">
      
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-white/85 px-4 py-3 shadow-[0_1px_2px_rgba(28,25,23,0.04)] backdrop-blur-md sm:px-8">
        <motion.button
          onClick={onClose}
          whileHover={prefersReducedMotion ? undefined : { x: -2 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 transition hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
          <span className="text-sm font-semibold text-gray-700">Back to stays</span>
        </motion.button>
        {onToggleFavorite && (
          <motion.button
            onClick={onToggleFavorite}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-[#fe424d]"
            title={isFavorite ? "Saved in wishlist" : "Save to wishlist"}
          >
            <Heart
              className={`h-4.5 w-4.5 transition-colors ${
                isFavorite ? 'fill-[#fe424d] text-[#fe424d]' : 'text-gray-700'
              }`}
            />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </motion.button>
        )}
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        
        <Reveal>
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {listing.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600">
                  {listing.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified stay
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {listing.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-current text-gray-900" />
                <span className="font-semibold text-gray-900">{avgRating ? avgRating : 'New'}</span>
                <span className="text-gray-300">·</span>
                <span className="font-medium text-gray-600 underline decoration-gray-300 underline-offset-2">
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </span>
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />
              <span className="inline-flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-gray-500" />
                {listing.location}, {listing.country}
              </span>
            </div>
          </div>
        </Reveal>

        
        <Reveal offset={18}>
          <ListingGallery
            listing={listing}
            capacitySummary={capacitySummary}
            heroImagePosition={heroImagePosition}
          />
        </Reveal>

        
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3 lg:gap-12">
          
          <div className="space-y-8 lg:col-span-2">
            <Reveal delay={0.05}>
              <div className="border-b border-gray-200/80 pb-4">
                <p className="text-sm font-medium text-gray-700">Hosted by {ownerName}</p>
              </div>
            </Reveal>

            
            <Reveal delay={0.08}>
              <StayAmenities listing={listing} />
            </Reveal>

            
            <Reveal delay={0.11}>
              <TwoMonthCalendar
                checkIn={checkIn}
                checkOut={checkOut}
                bookedDates={bookedDates}
                onDatesChange={(newCheckIn, newCheckOut) => {
                  setCheckIn(newCheckIn);
                  setCheckOut(newCheckOut);
                }}
                locationName={listing.location}
              />
            </Reveal>
          </div>

          
          <div className="lg:col-span-1">
            <Reveal delay={0.1}>
              <div className="sticky top-24">
                <div className="relative space-y-6 overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_2px_6px_rgba(28,25,23,0.04),0_28px_60px_-30px_rgba(28,25,23,0.4)]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#fe424d] via-rose-300 to-amber-200"
                  />

                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-400 line-through">
                      ₹{Math.round(listing.price * 1.1).toLocaleString("en-IN")}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{listing.price?.toLocaleString("en-IN") || listing.price}
                    </span>
                    <span className="text-sm text-gray-500">for 1 night</span>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-2xl border border-rose-100 bg-rose-50/80 p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#fe424d]" />
                    <p className="text-sm font-semibold leading-relaxed text-rose-600">
                      This host is offering a discount. Reserve now to lock in this special rate!
                    </p>
                  </div>

                  <BookingWidget
                    listingId={listing._id}
                    pricePerNight={listing.price}
                    maxGuests={listing.guests}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    isUnavailable={isRangeUnavailable}
                    isAvailabilityLoading={isAvailabilityFetching}
                    onDatesChange={(newCheckIn, newCheckOut) => {
                      setCheckIn(newCheckIn);
                      setCheckOut(newCheckOut);
                    }}
                    onAvailabilityRefresh={() => {
                      void refetchAvailability();
                    }}
                    onBookingConfirmed={() => {
                      setConfirmedRange({ checkIn, checkOut });
                    }}
                  />

                  <div className="border-t border-gray-100 pt-4">
                    <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Secure payment · You won't be charged yet
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        
        <Reveal>
          <div className="mt-14 border-t border-gray-200/80 pt-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  <MessageSquare className="h-3.5 w-3.5" /> Guest reviews
                </span>
                <h3 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-gray-900">
                  <Star className="h-6 w-6 fill-current text-amber-500" />
                  <span>
                    {avgRating ? `${avgRating} · ` : ''}
                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </span>
                </h3>
              </div>
              {totalReviews > 0 && (
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Loved by guests
                </span>
              )}
            </div>

          
          {currentUser ? (
            <div className="mb-12 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_20px_50px_-36px_rgba(28,25,23,0.35)] sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#fe424d] text-white flex items-center justify-center font-bold text-base uppercase">
                  {currentUser.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Leave a Review</h4>
                  <p className="text-xs text-gray-500">Logged in as @{currentUser.username}</p>
                </div>
              </div>

              {reviewSuccess && (
                <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
                  <span>✓</span> {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const isFilled = starValue <= (hoverRating || rating);
                        return (
                          <button
                            type="button"
                            key={starValue}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="cursor-pointer p-1 text-gray-300 transition hover:scale-110 hover:text-yellow-400 active:scale-95"
                            aria-label={`${starValue} star`}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                isFilled
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-medium text-gray-600 ml-2">
                      {ratingDescriptions[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Experience & Comments
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your experience with the host, cleanliness, location, check-in process, and amenities..."
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-3.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-[#fe424d] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e03a45] hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mb-12 rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#fe424d]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-gray-800">Have you stayed here?</h4>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Log in to rate this property and share your travel experience with the community.
              </p>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('login')}
                  className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#fe424d] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#e03a44] hover:shadow-md"
                >
                  Log In to Review
                </button>
              )}
            </div>
          )}

          
          {reviewsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {reviewsList.map((review: any) => {
                const authorId = review.author?._id || review.author;
                const isAuthor = currentUser && (authorId === currentUser._id || authorId === currentUser.id);

                return (
                  <div key={review._id} className="space-y-3 rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 font-bold uppercase text-[#fe424d]">
                          {review.author?.username?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {review.author?.username || 'Guest'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Recently'}
                          </p>
                        </div>
                      </div>

                      {isAuthor && (
                        <button
                          type="button"
                          onClick={() => handleReviewDelete(review._id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="Delete your review"
                          aria-label="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      {[...Array(Number(review.rating) || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      ))}
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {review.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to leave one above!</p>
          )}
          </div>
        </Reveal>

        
        <Reveal>
          <div className="mt-14 border-t border-gray-200/80 pt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Where you'll be</h3>
                <p className="mt-1.5 flex items-center text-sm text-gray-600">
                  <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                  {listing.location}, {listing.country}
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">
                Exact location shared after booking
              </span>
            </div>
            <div className="relative z-0 flex h-96 w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200/80 bg-gray-100 shadow-inner">
            {listing.geometry?.coordinates ? (
              <MapContainer
                key={listing._id || `${listing.geometry.coordinates[1]}-${listing.geometry.coordinates[0]}`}
                center={[listing.geometry.coordinates[1], listing.geometry.coordinates[0]]}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                />
                <Marker position={[listing.geometry.coordinates[1], listing.geometry.coordinates[0]]} />
              </MapContainer>
            ) : (
              <p className="text-gray-500">Map view unavailable</p>
            )}
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
};
