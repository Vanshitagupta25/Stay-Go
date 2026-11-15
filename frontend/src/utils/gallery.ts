export const MAX_GALLERY_IMAGES = 5;

interface GalleryImage {
  url?: string | null;
}

interface GallerySource {
  image?: GalleryImage | null;
  images?: GalleryImage[] | null;
}

export function getGalleryImages(
  listing?: GallerySource | null,
  limit = MAX_GALLERY_IMAGES
): string[] {
  if (!listing) return [];

  const urls: string[] = [];
  const max = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : MAX_GALLERY_IMAGES;

  const add = (url?: string | null) => {
    const trimmed = url?.trim();
    if (!trimmed || urls.includes(trimmed) || urls.length >= max) return;
    urls.push(trimmed);
  };

  add(listing.image?.url);

  if (Array.isArray(listing.images)) {
    for (const image of listing.images) {
      add(image?.url);
    }
  }

  return urls;
}
