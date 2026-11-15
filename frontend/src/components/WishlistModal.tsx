import React, { useEffect, useState } from 'react';
import { X, Heart, Star, Compass, Loader2 } from 'lucide-react';
import { authService } from '../services';
import type { Listing } from '../types/listing';

export interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onRemoveFavorite?: (listingId: string) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  onSelectListing,
  onRemoveFavorite,
}) => {
  const [wishlistItems, setWishlistItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    authService
      .getWishlist()
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.wishlist)) {
          // Filter out null or undefined listings if any
          const validListings = res.wishlist.filter(
            (item: any) => item && typeof item === 'object' && item._id
          );
          setWishlistItems(validListings);
        } else {
          setWishlistItems([]);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load your wishlist.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRemove = async (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setWishlistItems((prev) => prev.filter((item) => item._id !== listingId));
      if (onRemoveFavorite) {
        onRemoveFavorite(listingId);
      } else {
        await authService.toggleWishlist(listingId);
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#fe424d]">
              <Heart className="w-5 h-5 fill-[#fe424d]" />
            </div>
            <div>
              <h2 id="wishlist-modal-title" className="text-lg font-bold text-gray-900">
                My Wishlists
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'saved place' : 'saved places'}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#fe424d] mb-3" />
              <p className="text-sm font-medium">Loading your favorite stays...</p>
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

          {!loading && !error && wishlistItems.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-[#fe424d] flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your wishlist is empty</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                As you search and explore stays, tap the heart icon to save your favorite places here.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-2 bg-[#fe424d] hover:bg-[#e03a45] text-white px-6 py-2.5 rounded-full text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Start Exploring</span>
              </button>
            </div>
          )}

          {!loading && !error && wishlistItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlistItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    onSelectListing(item);
                    onClose();
                  }}
                  className="group cursor-pointer rounded-2xl border border-gray-150 overflow-hidden hover:shadow-md transition-all duration-200 bg-white flex flex-col"
                >
                  <div className="relative aspect-[16/11] bg-gray-100 overflow-hidden">
                    <img
                      src={
                        item.image?.url ||
                        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, item._id)}
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                      className="absolute top-2.5 right-2.5 bg-white/90 hover:bg-white text-[#fe424d] p-1.5 rounded-full shadow-xs hover:scale-110 active:scale-90 transition cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-[#fe424d]" />
                    </button>
                  </div>
                  <div className="p-3.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                        {item.location}, {item.country}
                      </h4>
                      {item.avgRating !== null && item.avgRating !== undefined ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-900 shrink-0">
                          <Star className="w-3 h-3 fill-current text-gray-900" />
                          <span>{Number(item.avgRating).toFixed(1)}</span>
                        </div>
                      ) : null}
                    </div>
                    <p className="text-gray-500 text-xs truncate">{item.title}</p>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        ₹{item.price?.toLocaleString('en-IN') || item.price}
                      </span>
                      <span className="text-gray-400 text-[11px]">night</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
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
  );
};
