import type { Listing } from '../types/listing';

export type ListingPayloadInput = Partial<Listing>;

function appendNumber(formData: FormData, key: string, value: number | null | undefined): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) return;
  formData.append(key, String(value));
}

export function buildListingFormData(input: ListingPayloadInput, imageFile?: File | null): FormData {
  const formData = new FormData();

  formData.append('listing[title]', input.title || '');
  formData.append('listing[description]', input.description || '');
  formData.append('listing[price]', String(input.price ?? 0));
  formData.append('listing[location]', input.location || '');
  formData.append('listing[country]', input.country || '');
  formData.append('listing[category]', input.category || '');

  appendNumber(formData, 'listing[guests]', input.guests);
  appendNumber(formData, 'listing[bedrooms]', input.bedrooms);
  appendNumber(formData, 'listing[beds]', input.beds);
  appendNumber(formData, 'listing[bathrooms]', input.bathrooms);

  if (input.amenities !== undefined) {
    formData.append('listing[amenities]', JSON.stringify(input.amenities));
  }

  if (imageFile) {
    formData.append('image', imageFile);
  }

  return formData;
}
