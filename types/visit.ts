export interface WineryVisit {
  id: string;
  wineryId: string;
  wineryName: string;
  userId: string;
  visitDate: string; // ISO date string
  winesLoved: string;
  winesDisliked: string;
  boughtBottle: string;
  wouldRecommend: boolean;
  howLongStayed: string;
  whatStoodOut: string;
  shareWithVineyard: boolean;
  comments: string;
  photos: string[]; // Array of base64 encoded images or URLs
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface WineryVisitFormData {
  visitDate: string;
  winesLoved: string;
  winesDisliked: string;
  boughtBottle: string;
  wouldRecommend: boolean;
  howLongStayed: string;
  whatStoodOut: string;
  shareWithVineyard: boolean;
  comments: string;
  photos: File[];
}
