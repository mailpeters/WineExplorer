// types/winery.ts

export interface Winery {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  region: string;
  // Optional fields for later
  lat?: number;
  lng?: number;
  avgRating?: number;
  totalRatings?: number;
  totalVisits?: number;
}

export interface WineryRegion {
  name: string;
  count: number;
}