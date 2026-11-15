import React from 'react';
import type { Listing } from '../types/listing';
import { getAmenitiesForVilla } from '../utils/amenities';

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

  const amenitiesList = getAmenitiesForVilla(effectiveListing);

  if (!amenitiesList || amenitiesList.length === 0) {
    return null;
  }

  return (
    <div className={`pt-8 border-t border-gray-200 ${className}`}>
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
        {amenitiesList.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key || item.title}
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200/90 bg-gray-50/60 hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-2xs hover:shadow-xs group"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#fe424d] group-hover:scale-105 transition-transform duration-200 shadow-2xs shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base text-gray-900 leading-snug">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
