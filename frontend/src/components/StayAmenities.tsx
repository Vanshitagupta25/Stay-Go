import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Listing } from '../types/listing';
import { getAmenitiesForVilla } from '../utils/amenities';
import { DURATIONS, EASE_SUBTLE, getStaggerDelay } from '../utils/motion';

export interface StayAmenitiesProps {
  listing?: Listing | null;
  amenities?: string[];
  className?: string;
}

export const StayAmenities: React.FC<StayAmenitiesProps> = ({
  listing,
  amenities,
  className = '',
}) => {
  const effectiveListing = listing
    ? { ...listing, amenities: amenities !== undefined ? amenities : listing.amenities }
    : ({ amenities } as Listing);
  const prefersReducedMotion = useReducedMotion();

  const amenitiesList = getAmenitiesForVilla(effectiveListing);

  if (!amenitiesList || amenitiesList.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">Stay Amenities</h3>
          <p className="text-xs text-gray-500 mt-0.5">Facilities offered at this stay</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-[#fe424d] rounded-full border border-rose-100">
          {amenitiesList.length} {amenitiesList.length === 1 ? 'facility' : 'facilities'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {amenitiesList.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.key || item.title}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: DURATIONS.base,
                ease: EASE_SUBTLE,
                delay: getStaggerDelay(index, 0.04),
              }}
              className="group flex items-center gap-4 rounded-2xl border border-gray-200/90 bg-gray-50/60 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-[#fe424d] shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-gray-900 sm:text-base">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
