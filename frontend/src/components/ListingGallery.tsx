import React from 'react';
import { Bath, BedDouble, Home, MapPin, Users } from 'lucide-react';
import type { Listing } from '../types/listing';
import { getGalleryImages } from '../utils/gallery';

interface ListingGalleryProps {
  listing: Partial<Listing>;
  capacitySummary?: string;
  heroImagePosition?: React.CSSProperties['objectPosition'];
}

interface GalleryPhotoProps {
  src: string;
  alt: string;
  heroImagePosition: React.CSSProperties['objectPosition'];
  className?: string;
  overlay?: React.ReactNode;
}

const GalleryPhoto: React.FC<GalleryPhotoProps> = ({
  src,
  alt,
  heroImagePosition,
  className = '',
  overlay,
}) => (
  <div className={`group relative overflow-hidden bg-gray-100 ${className}`}>
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
      style={{ objectPosition: heroImagePosition }}
    />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
    {overlay}
  </div>
);

export const ListingGallery: React.FC<ListingGalleryProps> = ({
  listing,
  capacitySummary,
  heroImagePosition = 'center',
}) => {
  const images = getGalleryImages(listing);
  const title = listing.title || 'Stay';
  const location = [listing.location, listing.country].filter(Boolean).join(', ');

  if (images.length === 0) {
    return (
      <div className="mb-8 flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-gray-100 ring-1 ring-black/5 md:aspect-auto md:h-[420px] lg:h-[440px]">
        <span className="text-sm font-medium tracking-wide text-gray-400">No image added</span>
      </div>
    );
  }

  if (images.length > 1) {
    const remaining = images.slice(1, 5);

    return (
      <section
        aria-label="Property photo gallery"
        className="mb-8 grid grid-cols-2 gap-2 overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-black/5 md:h-[420px] md:grid-cols-4 md:grid-rows-2 lg:h-[440px] lg:grid-cols-4 lg:grid-rows-2"
      >
        <GalleryPhoto
          src={images[0]}
          alt={`${title} - main photo`}
          heroImagePosition={heroImagePosition}
          className="col-span-2 row-span-2 aspect-[4/3] md:aspect-auto lg:aspect-auto"
          overlay={
            <>
              <span className="absolute right-3 top-3 z-10 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                1 / {images.length}
              </span>
              {location && (
                <span className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
            </>
          }
        />

        {remaining.map((url, index) => (
          <GalleryPhoto
            key={url}
            src={url}
            alt={`${title} - photo ${index + 2}`}
            heroImagePosition={heroImagePosition}
            className="min-h-[140px] md:min-h-0 lg:min-h-0"
          />
        ))}

        {Array.from({ length: Math.max(0, 4 - remaining.length) }).map((_, index) => (
          <div
            key={`gallery-spacer-${index}`}
            className="flex min-h-[140px] items-center justify-center bg-white/60 md:min-h-0 lg:min-h-0"
          >
            <Home className="h-5 w-5 text-gray-300" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      aria-label="Property photo gallery"
      className="mb-8 grid grid-cols-1 gap-3 md:h-[420px] md:grid-cols-[minmax(0,7fr)_minmax(280px,5fr)] lg:h-[440px] lg:grid-cols-[minmax(0,7fr)_minmax(280px,5fr)]"
    >
      <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_24px_60px_-36px_rgba(28,25,23,0.45)] ring-1 ring-black/5 md:aspect-auto md:h-full lg:aspect-auto lg:h-full">
        <img
          src={images[0]}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
          style={{ objectPosition: heroImagePosition }}
        />
        <img
          src={images[0]}
          alt={title}
          className="relative z-10 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
          style={{ objectPosition: heroImagePosition }}
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {location && (
          <span className="absolute bottom-4 left-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 md:grid-rows-2 lg:grid-cols-1 lg:grid-rows-2">
        <div className="flex flex-col justify-between rounded-3xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-24px_rgba(28,25,23,0.25)]">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-[#fe424d]">
              <MapPin className="h-5 w-5" />
            </span>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Where you'll be
            </p>
            <p className="mt-1 text-base font-semibold leading-6 text-gray-900 sm:text-lg">
              {location || 'Location shared after booking'}
            </p>
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            Exact address is shared after your reservation is confirmed.
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-24px_rgba(28,25,23,0.25)]">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Home className="h-5 w-5" />
            </span>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Stay details
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-gray-900">
              {capacitySummary || 'Entire stay'}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              Guests
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 text-gray-400" />
              Beds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5 text-gray-400" />
              Baths
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
