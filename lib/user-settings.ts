import { BeverageType } from '@/types/winery';

// US States list
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export interface UserSettings {
  // Profile
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;

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
}

const DEFAULT_SETTINGS: UserSettings = {
  name: '',
  address: '',
  city: '',
  state: 'VA',
  zip: '',
  phone: '',
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
};

export function loadSettings(userId?: string): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    // Use user-specific key if userId is provided, otherwise use global key
    const storageKey = userId ? `wineExplorerSettings_${userId}` : 'wineExplorerSettings';
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings, userId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    // Use user-specific key if userId is provided, otherwise use global key
    const storageKey = userId ? `wineExplorerSettings_${userId}` : 'wineExplorerSettings';
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}
