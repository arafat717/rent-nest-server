export type TProperty = {
  title: string;
  description: string;
  type: "APARTMENT" | "HOUSE" | "STUDIO" | "CONDO" | "ROOM" | "VILLA";
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft?: number;
  location: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  images?: string[];
  categoryId: string;
};

export type TPropertyFilters = {
  city?: string;
  location?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  amenities?: string;
  page?: string;
  limit?: string;
};
