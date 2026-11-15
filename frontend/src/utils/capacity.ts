import type { Listing } from '../types/listing';

export interface CapacityInput {
  guests?: number | null;
  bedrooms?: number | null;
  beds?: number | null;
  bathrooms?: number | null;
}

function positiveValue(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

function countLabel(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function formatCapacitySummary(listing?: CapacityInput | Partial<Listing> | null): string {
  if (!listing) return '';

  const parts: string[] = [];
  const guests = positiveValue(listing.guests);
  const bedrooms = positiveValue(listing.bedrooms);
  const beds = positiveValue(listing.beds);
  const bathrooms = positiveValue(listing.bathrooms);

  if (guests !== null) parts.push(countLabel(guests, 'guest', 'guests'));
  if (bedrooms !== null) parts.push(countLabel(bedrooms, 'bedroom', 'bedrooms'));
  if (beds !== null) parts.push(countLabel(beds, 'bed', 'beds'));
  if (bathrooms !== null) parts.push(countLabel(bathrooms, 'bath', 'baths'));

  return parts.join(' · ');
}
