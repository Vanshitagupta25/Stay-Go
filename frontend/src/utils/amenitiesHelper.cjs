const STAY_AMENITIES_MAP = {
  ac: {
    key: 'ac',
    title: 'AC',
    description: 'Climate Control',
    icon: 'Wind',
  },
  wifi: {
    key: 'wifi',
    title: 'Wi-Fi',
    description: 'High-Speed Internet',
    icon: 'Wifi',
  },
  pool: {
    key: 'pool',
    title: 'Pool',
    description: 'Swimming Pool',
    icon: 'Waves',
  },
  parking: {
    key: 'parking',
    title: 'Parking',
    description: 'Complimentary Parking',
    icon: 'Car',
  },
  steamBath: {
    key: 'steamBath',
    title: 'Steam Bath',
    description: 'Steam & Wellness Room',
    icon: 'Sparkles',
  },
};

const ALIASES = {
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
};

const CATEGORY_DEFAULT_AMENITIES = {
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

function normalizeAmenityKey(input) {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim().toLowerCase();
  const matchedKey = ALIASES[clean];
  if (matchedKey && STAY_AMENITIES_MAP[matchedKey]) {
    return matchedKey;
  }
  return null;
}

function getAmenitiesForListing(listing) {
  if (!listing) return [];

  // 1. If explicit amenities array is provided
  if (Array.isArray(listing.amenities)) {
    if (listing.amenities.length === 0) return [];
    const resolved = [];
    for (const item of listing.amenities) {
      const key = normalizeAmenityKey(item);
      if (key && STAY_AMENITIES_MAP[key]) {
        if (!resolved.some(r => r.key === key)) {
          resolved.push(STAY_AMENITIES_MAP[key]);
        }
      }
    }
    return resolved;
  }

  // 2. If listing does not specify amenities, dynamically derive tailored facilities per villa
  const category = (listing.category || '').trim();
  const defaultKeys = CATEGORY_DEFAULT_AMENITIES[category];
  if (defaultKeys && defaultKeys.length > 0) {
    return defaultKeys.map(k => STAY_AMENITIES_MAP[k]).filter(Boolean);
  }

  // 3. Fallback per characteristics (e.g. title/description contains keywords)
  const title = (listing.title || '').toLowerCase();
  const desc = (listing.description || '').toLowerCase();
  const keys = ['wifi'];
  if (title.includes('pool') || desc.includes('pool')) keys.push('pool');
  if (title.includes('luxury') || title.includes('loft') || desc.includes('luxury')) {
    keys.push('ac', 'parking', 'steamBath');
  } else {
    keys.push('parking');
  }

  return Array.from(new Set(keys)).map(k => STAY_AMENITIES_MAP[k]).filter(Boolean);
}

const TARGET_DESCRIPTION = "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!";

function isTargetVillaForAmenities(listing) {
  if (!listing) return false;
  const desc = listing.description || '';
  const title = (listing.title || '').toLowerCase();
  return desc.includes(TARGET_DESCRIPTION) || title.includes('modern loft in downtown');
}

module.exports = {
  STAY_AMENITIES_MAP,
  ALIASES,
  CATEGORY_DEFAULT_AMENITIES,
  normalizeAmenityKey,
  getAmenitiesForListing,
  TARGET_DESCRIPTION,
  isTargetVillaForAmenities,
};
