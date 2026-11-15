import React, { useState } from 'react';
import { useGetListingByIdQuery, useAddReviewMutation, useDeleteReviewMutation } from '../redux/api/listingApi';
import { BookingWidget } from './BookingWidget';
import { TwoMonthCalendar } from './TwoMonthCalendar';
import { StayAmenities } from './StayAmenities';
import { ArrowLeft, Star, MapPin, Trash2, Send, MessageSquare, Heart } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet with bundlers
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
  onClose: () => void;
}

export const ListingShow: React.FC<ListingShowProps> = ({
  listingId,
  initialListing,
  currentUser,
  isFavorite = false,
  onToggleFavorite,
  onOpenAuthModal,
  onClose,
}) => {
  const { data, isLoading } = useGetListingByIdQuery(listingId);
  const [addReview, { isLoading: isSubmittingReview }] = useAddReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');

  // Review Form States
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string>('');

  const listing = data?.listing || initialListing;
  const ownerName = listing?.owner?.username || 'Guest Host';

  const isTargetVilla = Boolean(
    listing?.description?.includes('Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!') ||
    listing?.title?.toLowerCase().includes('modern loft')
  );

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
      await deleteReview({ listingId: listing._id, reviewId }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete review.");
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-xl text-gray-700">Failed to load listing.</p>
        <button onClick={onClose} className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full hover:bg-gray-100 border border-gray-200 transition text-sm font-semibold text-gray-800 cursor-pointer shadow-2xs hover:shadow-xs"
            title={isFavorite ? "Saved in wishlist" : "Save to wishlist"}
          >
            <Heart
              className={`w-4.5 h-4.5 transition-colors ${
                isFavorite
                  ? 'fill-[#fe424d] text-[#fe424d]'
                  : 'text-gray-700'
              }`}
            />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-gray-900 fill-current" />
              <span className="font-semibold text-gray-900 mr-1">
                {avgRating ? avgRating : 'New'}
              </span>
              <span className="underline decoration-gray-400">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </span>
            <span className="flex items-center underline decoration-gray-400 font-medium">
              <MapPin className="w-4 h-4 mr-1" />
              {listing.location}, {listing.country}
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden mb-8 shadow-sm">
          <img
            src={listing.image?.url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Column - Details & Two-Month Calendar */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {listing.category} hosted by {ownerName}
                </h2>
                <p className="text-gray-500 mt-1">{listing.guests || 2} guests · 1 bedroom · 1 bed · 1 private bath</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 uppercase overflow-hidden shadow-sm">
                {ownerName.charAt(0)}
              </div>
            </div>

            {/* Listing Description (hidden when replaced by Stay Amenities for this villa) */}
            {!isTargetVilla && listing.description && (
              <div className="pb-6 border-b border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Two-Month Calendar Component (Positioned to the left of the booking box) */}
            <TwoMonthCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onDatesChange={(newCheckIn, newCheckOut) => {
                setCheckIn(newCheckIn);
                setCheckOut(newCheckOut);
              }}
              locationName={listing.location}
            />

            {/* Stay Amenities Section - Dynamic as per each villa */}
            <StayAmenities listing={listing} />
          </div>

          {/* Right Column - Sticky Booking Widget ("1,320 ₹1,200 for 1 night box") */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-xl space-y-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold line-through text-gray-400">
                    ₹{Math.round(listing.price * 1.1).toLocaleString("en-IN")}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{listing.price?.toLocaleString("en-IN") || listing.price}
                  </span>
                  <span className="text-gray-500">for 1 night</span>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                  <p className="text-rose-600 font-semibold text-sm">
                    This host is offering a discount. Reserve now to lock in this special rate!
                  </p>
                </div>

                <BookingWidget
                  listingId={listing._id}
                  pricePerNight={listing.price}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onDatesChange={(newCheckIn, newCheckOut) => {
                    setCheckIn(newCheckIn);
                    setCheckOut(newCheckOut);
                  }}
                />

                <div className="text-center pt-2">
                  <p className="text-gray-500 text-sm font-medium">You won't be charged yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-14 pt-10 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <span>{avgRating ? `${avgRating} · ` : ''}{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
            </h3>
          </div>

          {/* Add Review Form for Logged-In User */}
          {currentUser ? (
            <div className="mb-12 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
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
                            className="p-1 text-gray-300 hover:text-yellow-400 transition cursor-pointer"
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
                    className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white placeholder-gray-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex items-center gap-2 bg-[#fe424d] hover:bg-[#e03a45] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
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
            <div className="mb-12 bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h4 className="text-base font-semibold text-gray-800">Have you stayed here?</h4>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Log in to rate this property and share your travel experience with the community.
              </p>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('login')}
                  className="mt-4 inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Log In to Review
                </button>
              )}
            </div>
          )}

          {/* List of Existing Reviews */}
          {reviewsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {reviewsList.map((review: any) => {
                const authorId = review.author?._id || review.author;
                const isAuthor = currentUser && (authorId === currentUser._id || authorId === currentUser.id);

                return (
                  <div key={review._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 uppercase">
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

        {/* Where you'll be (Map moved to the very end) */}
        <div className="mt-14 pt-10 border-t border-gray-200">
          <h3 className="text-2xl font-semibold mb-2 text-gray-900">Where you'll be</h3>
          <p className="text-gray-600 mb-6 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-gray-500" />
            {listing.location}, {listing.country}
          </p>
          <div className="bg-gray-100 w-full h-96 rounded-2xl flex items-center justify-center border border-gray-200 shadow-inner relative overflow-hidden z-0">
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
      </main>
    </div>
  );
};
