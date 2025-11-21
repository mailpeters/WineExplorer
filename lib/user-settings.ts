import { BeverageType } from '@/types/winery';

export interface UserSettings {
  defaultCategories: {
    winery: boolean;
    cidery: boolean;
    brewery: boolean;
    distillery: boolean;
  };
  favoriteRegion?: string;
  sortBy: 'name' | 'distance' | 'rating';
  viewMode: 'grid' | 'list';
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultCategories: {
    winery: true,
    cidery: false,
    brewery: false,
    distillery: false,
  },
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
