import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import type { Listing } from '../types/listing';
import { DURATIONS, EASE_SUBTLE, getStaggerDelay } from '../utils/motion';

export interface ListingCardProps {
  listing: Listing;
  index: number;
  isFavorite: boolean;
  isHighlighted?: boolean;
  compact?: boolean;
  onOpen: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onHoverChange?: (id: string | null) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  index,
  isFavorite,
  isHighlighted = false,
  compact = false,
  onOpen,
  onToggleFavorite,
  onHoverChange,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const showGuestFavourite = compact ? index % 2 === 0 : index % 3 === 0;
  const hasRating = listing.avgRating !== null && listing.avgRating !== undefined;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: DURATIONS.base,
        ease: EASE_SUBTLE,
        delay: getStaggerDelay(index),
      }}
      onClick={onOpen}
      onMouseEnter={() => onHoverChange?.(listing._id)}
      onMouseLeave={() => onHoverChange?.(null)}
      className={`group flex cursor-pointer flex-col transition-transform duration-300 ease-out hover:-translate-y-1 ${
        isHighlighted ? 'z-10' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-gray-100 transition-all duration-300 ${
          compact ? 'mb-2.5 aspect-[16/11] sm:aspect-[4/3]' : 'mb-3 aspect-[16/11]'
        } ${
          isHighlighted
            ? 'ring-2 ring-gray-900/15 stay-shadow-lift'
            : 'ring-1 ring-black/5 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-20px_rgba(28,25,23,0.25)] group-hover:shadow-[0_2px_6px_rgba(28,25,23,0.05),0_26px_48px_-26px_rgba(28,25,23,0.35)]'
        }`}
      >
        {listing.image?.url ? (
          <img
            src={listing.image.url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-xs font-medium tracking-wide text-gray-400">No image added</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {showGuestFavourite && (
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-gray-900 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fe424d]" />
            <span>Guest favourite</span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute right-2.5 top-2.5 z-10 rounded-full p-1.5 text-white drop-shadow-md transition-all duration-200 hover:scale-110 hover:bg-black/10 active:scale-90"
          title={isFavorite ? 'Saved in wishlist' : 'Add to wishlist'}
          aria-label={isFavorite ? 'Saved in wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-6 w-6 transition-colors ${
              isFavorite ? 'fill-[#fe424d] text-[#fe424d]' : 'fill-black/35 text-white stroke-[2]'
            }`}
          />
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-0.5 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="min-w-0 truncate text-[13.5px] font-semibold text-gray-900">
            {listing.location}, {listing.country}
          </h3>
          {hasRating ? (
            <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-900">
              <Star className="h-3 w-3 fill-current text-gray-900" />
              <span>{Number(listing.avgRating).toFixed(1)}</span>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-gray-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-semibold text-gray-800">New</span>
            </div>
          )}
        </div>

        <p className="truncate text-xs text-gray-500">{listing.title}</p>

        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-[14px] font-bold text-gray-900">
            ₹{listing.price?.toLocaleString('en-IN') || listing.price}
          </span>
          <span className="text-[11px] font-normal text-gray-500">night</span>
        </div>
      </div>
    </motion.div>
  );
};
