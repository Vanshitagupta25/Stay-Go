const TEXT_FIELDS = ['title', 'description', 'location', 'country', 'category'];
const NUMBER_FIELDS = ['price', 'guests', 'bedrooms', 'beds', 'bathrooms'];

function readRawField(body, field) {
  if (!body || typeof body !== 'object') return undefined;
  if (body.listing && typeof body.listing === 'object' && body.listing[field] !== undefined) {
    return body.listing[field];
  }
  return body[`listing[${field}]`];
}

function toFiniteNumber(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseAmenities(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return undefined;
}

function normalizeListingPayload(body = {}) {
  const listing = {};

  for (const field of TEXT_FIELDS) {
    const value = readRawField(body, field);
    if (value !== undefined) listing[field] = value;
  }

  for (const field of NUMBER_FIELDS) {
    const value = toFiniteNumber(readRawField(body, field));
    if (value !== undefined) listing[field] = value;
  }

  const amenities = parseAmenities(readRawField(body, 'amenities'));
  if (amenities !== undefined) listing.amenities = amenities;

  return listing;
}

module.exports = {
  normalizeListingPayload,
  parseAmenities,
  toFiniteNumber,
};
