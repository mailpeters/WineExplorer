import { BeverageType } from '@/types/winery';

export interface UserSettings {
  // Profile
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;

  // Interested in
  defaultCategories: {
    winery: boolean;
    cidery: boolean;
    brewery: boolean;
    distillery: boolean;
  };

  // Communication preferences
  communicationPreferences: {
    phone: boolean;
    email: boolean;
    phoneRequired?: boolean;
  };

  // Alerts
  enableAlerts: boolean;
  alertRadius?: number; // in miles

  // Display preferences
  favoriteRegion?: string;
  sortBy: 'name' | 'distance' | 'rating';
  viewMode: 'grid' | 'list';
}

const DEFAULT_SETTINGS: UserSettings = {
  name: '',
  address: '',
  city: '',
  state: 'VA',
  zip: '',
  defaultCategories: {
    winery: true,
    cidery: false,
    brewery: false,
    distillery: false,
  },
  communicationPreferences: {
    phone: false,
    email: true,
    phoneRequired: false,
  },
  enableAlerts: false,
  alertRadius: 25,
  sortBy: 'name',
  viewMode: 'grid',
};

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem('wineExplorerSettings');
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('wineExplorerSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}
