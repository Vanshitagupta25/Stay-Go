import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Listing } from '../types/listing';
import { Star } from 'lucide-react';

interface CitySplitMapProps {
  listings: Listing[];
  searchCity: string;
  hoveredListingId?: string | null;
  onSelectListing: (listing: Listing) => void;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  goa: [15.2993, 74.124],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  manali: [32.2432, 77.1892],
  udaipur: [24.5854, 73.7125],
  jaipur: [26.9124, 75.7873],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  pune: [18.5204, 73.8567],
  shimla: [31.1048, 77.1734],
  rishikesh: [30.0869, 78.2676],
  kolkata: [22.5726, 88.3639],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.385, 78.4867],
  lonavala: [18.7557, 73.4091],
  kerala: [10.8505, 76.2711],
  ooty: [11.4102, 76.695],
};

function MapAutoBounds({
  bounds,
  fallbackCenter,
}: {
  bounds: [number, number][] | null;
  fallbackCenter: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    if (bounds && bounds.length > 1) {
      try {
        const leafletBounds = L.latLngBounds(bounds);
        map.fitBounds(leafletBounds, {
          padding: [50, 50],
          maxZoom: 14,
          animate: true,
        });
      } catch {
        map.setView(fallbackCenter, 12);
      }
    } else if (bounds && bounds.length === 1) {
      map.setView(bounds[0], 13, { animate: true });
    } else {
      map.setView(fallbackCenter, 12, { animate: true });
    }
  }, [bounds, fallbackCenter, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
}

function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomIn();
        }}
        aria-label="Zoom in"
        title="Zoom in"
        className="w-8.5 h-8.5 bg-white/95 hover:bg-white text-gray-800 hover:text-black rounded-lg shadow-md hover:shadow-lg border border-gray-200/90 backdrop-blur-xs flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer font-bold text-lg select-none leading-none"
      >
        +
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomOut();
        }}
        aria-label="Zoom out"
        title="Zoom out"
        className="w-8.5 h-8.5 bg-white/95 hover:bg-white text-gray-800 hover:text-black rounded-lg shadow-md hover:shadow-lg border border-gray-200/90 backdrop-blur-xs flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer font-bold text-lg select-none leading-none"
      >
        −
      </button>
    </div>
  );
}

function createPinMarkerIcon(isHovered: boolean) {
  return L.divIcon({
    className: 'stay-map-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${isHovered ? '32px' : '26px'};
        height: ${isHovered ? '40px' : '34px'};
        transform: ${isHovered ? 'scale(1.15) translateY(-4px)' : 'scale(1)'};
        transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
        cursor: pointer;
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.32));
      ">
        <svg viewBox="0 0 24 32" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 10.5 30.5 11.3 31.4C11.7 31.8 12.3 31.8 12.7 31.4C13.5 30.5 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="${isHovered ? '#111827' : '#fe424d'}"/>
          <circle cx="12" cy="11" r="4.5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

export const CitySplitMap: React.FC<CitySplitMapProps> = ({
  listings,
  searchCity,
  hoveredListingId,
  onSelectListing,
}) => {
  const cityKey = searchCity.trim().toLowerCase();
  const defaultCenter: [number, number] = useMemo(() => {
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (cityKey.includes(key) || key.includes(cityKey)) {
        return coords;
      }
    }
    return [20.5937, 78.9629]; // Default to India center
  }, [cityKey]);

  const listingsWithCoords = useMemo(() => {
    return listings.map((listing, index) => {
      let lat: number | null = null;
      let lng: number | null = null;

      if (
        listing.geometry?.coordinates &&
        Array.isArray(listing.geometry.coordinates) &&
        listing.geometry.coordinates.length === 2
      ) {
        lng = Number(listing.geometry.coordinates[0]);
        lat = Number(listing.geometry.coordinates[1]);
      }

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        lat = defaultCenter[0] + ((index % 5) - 2) * 0.015;
        lng = defaultCenter[1] + ((Math.floor(index / 5) % 5) - 2) * 0.015;
      }

      return {
        ...listing,
        lat,
        lng,
      };
    });
  }, [listings, defaultCenter]);

  const bounds: [number, number][] | null = useMemo(() => {
    if (listingsWithCoords.length === 0) return null;
    return listingsWithCoords.map((item) => [item.lat, item.lng]);
  }, [listingsWithCoords]);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-2xl overflow-hidden flex flex-col flex-1">
      <MapContainer
        center={bounds && bounds.length > 0 ? bounds[0] : defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full flex-1 z-0"
        style={{ width: '100%', height: '100%' }}
      >
        
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />

        
        <CustomZoomControl />

        <MapAutoBounds bounds={bounds} fallbackCenter={defaultCenter} />

        {listingsWithCoords.map((item) => {
          const isHovered = hoveredListingId === item._id;
          return (
            <Marker
              key={item._id}
              position={[item.lat, item.lng]}
              icon={createPinMarkerIcon(isHovered)}
            >
              <Popup className="stay-map-popup" closeButton={false}>
                <div
                  onClick={() => onSelectListing(item)}
                  className="w-52 cursor-pointer group text-left p-1"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-2">
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-gray-900 text-xs truncate">
                      {item.location}, {item.country}
                    </h4>
                    <span className="flex items-center text-[11px] font-bold text-gray-800 shrink-0">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-0.5" />
                      {item.avgRating ? Number(item.avgRating).toFixed(1) : 'New'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.title}</p>
                  <div className="mt-2 pt-1 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">
                      ₹{item.price?.toLocaleString('en-IN')}{' '}
                      <span className="font-normal text-gray-500 text-[10px]">/ night</span>
                    </span>
                    <span className="text-[11px] font-semibold text-[#fe424d] group-hover:underline">
                      View details →
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
