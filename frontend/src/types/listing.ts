export interface Listing {
  _id: string;
  title: string;
  description: string;
  image?: {
    filename?: string;
    url?: string;
  };
  price: number;
  location: string;
  country: string;
  category?: string;
  guests?: number;
  amenities?: string[];
  geometry?: {
    type?: string;
    coordinates?: [number, number];
  };
  reviews?: any[];
  avgRating?: number | null;
  reviewCount?: number;
}
