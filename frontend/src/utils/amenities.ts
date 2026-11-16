import React from 'react';
import { Wind, Wifi, Waves, Car, Sparkles, Utensils, Tv, Dumbbell, ShieldCheck } from 'lucide-react';
import type { Listing } from '../types/listing';

export interface AmenityDefinition {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const KNOWN_AMENITIES: Record<string, AmenityDefinition> = {
  ac: {
    key: 'ac',
    title: 'AC',
    description: 'Climate Control',
    icon: Wind,
  },
  wifi: {
    key: 'wifi',
    title: 'Wi-Fi',
    description: 'High-Speed Internet',
    icon: Wifi,
  },
  pool: {
    key: 'pool',
    title: 'Pool',
    description: 'Swimming Pool',
    icon: Waves,
  },
  parking: {
    key: 'parking',
    title: 'Parking',
    description: 'Complimentary Parking',
    icon: Car,
  },
  steamBath: {
    key: 'steamBath',
    title: 'Steam Bath',
    description: 'Steam & Wellness Room',
    icon: Sparkles,
  },
  kitchen: {
    key: 'kitchen',
    title: 'Kitchen',
    description: "Chef's Kitchen",
    icon: Utensils,
  },
  tv: {
    key: 'tv',
    title: 'TV',
    description: 'HD Smart TV',
    icon: Tv,
  },
  gym: {
    key: 'gym',
    title: 'Gym',
    description: 'Fitness Center',
    icon: Dumbbell,
  },
};

const ALIAS_MAP: Record<string, string> = {
  'ac': 'ac',
  'air conditioning': 'ac',
  'climate control': 'ac',
  'wifi': 'wifi',
  'wi-fi': 'wifi',
  'internet': 'wifi',
  'high-speed internet': 'wifi',
  'pool': 'pool',
  'swimming pool': 'pool',
  'pools': 'pool',
  'parking': 'parking',
  'complimentary parking': 'parking',
  'car parking': 'parking',
  'free parking': 'parking',
  'steambath': 'steamBath',
  'steam bath': 'steamBath',
  'steam & wellness room': 'steamBath',
  'sauna': 'steamBath',
  'wellness': 'steamBath',
  'kitchen': 'kitchen',
  'tv': 'tv',
  'television': 'tv',
  'gym': 'gym',
  'fitness': 'gym',
};

const CATEGORY_DEFAULT_AMENITIES: Record<string, string[]> = {
  pools: ['pool', 'wifi', 'parking', 'ac'],
  beach: ['ac', 'wifi', 'pool', 'parking'],
  mountains: ['wifi', 'parking', 'steamBath'],
  farms: ['wifi', 'parking', 'ac'],
  rooms: ['wifi', 'ac'],
  iconicCities: ['ac', 'wifi', 'parking', 'steamBath'],
  camping: ['wifi', 'parking'],
  domes: ['wifi', 'parking', 'ac'],
  bedAndBreakfast: ['wifi', 'ac', 'parking'],
  trending: ['ac', 'wifi', 'pool', 'parking', 'steamBath'],
};

export function normalizeAmenityKey(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim().toLowerCase();
  const matched = ALIAS_MAP[clean];
  if (matched && KNOWN_AMENITIES[matched]) {
    return matched;
  }
  return null;
}

export function getAmenitiesForVilla(listing?: Listing | null): AmenityDefinition[] {
  if (!listing) return [];

  if (Array.isArray(listing.amenities) && listing.amenities.length > 0) {
    const result: AmenityDefinition[] = [];
    for (const raw of listing.amenities) {
      const key = normalizeAmenityKey(raw);
      if (key && KNOWN_AMENITIES[key]) {
        if (!result.some((r) => r.key === key)) {
          result.push(KNOWN_AMENITIES[key]);
        }
      } else if (raw && raw.trim()) {
        result.push({
          key: raw.trim().toLowerCase(),
          title: raw.trim(),
          description: 'Provided Amenity',
          icon: ShieldCheck,
        });
      }
    }
    return result;
  }

  const desc = (listing.description || '').toLowerCase();
  const title = (listing.title || '').toLowerCase();
  if (
    desc.includes('stylish loft apartment') ||
    title.includes('modern loft')
  ) {
    return [
      KNOWN_AMENITIES.ac,
      KNOWN_AMENITIES.wifi,
      KNOWN_AMENITIES.pool,
      KNOWN_AMENITIES.parking,
      KNOWN_AMENITIES.steamBath,
    ];
  }

  const category = (listing.category || '').trim();
  const categoryKeys = CATEGORY_DEFAULT_AMENITIES[category];
  if (categoryKeys && categoryKeys.length > 0) {
    return categoryKeys.map((k) => KNOWN_AMENITIES[k]).filter(Boolean);
  }

  const keys: string[] = ['wifi'];
  if (title.includes('pool') || desc.includes('pool')) keys.push('pool');
  if (title.includes('villa') || title.includes('luxury') || desc.includes('luxury')) {
    keys.push('ac', 'parking', 'steamBath');
  } else {
    keys.push('parking');
  }

  return Array.from(new Set(keys))
    .map((k) => KNOWN_AMENITIES[k])
    .filter(Boolean);
}

