// types/winery.ts

export type BeverageType = 'winery' | 'cidery' | 'brewery' | 'distillery';

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
  categories: BeverageType[];
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