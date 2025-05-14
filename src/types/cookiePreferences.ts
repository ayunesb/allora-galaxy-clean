
/**
 * Cookie preferences type definitions
 */

export interface CookiePreferences {
  sessionAnalyticsEnabled: boolean;
  ga4Enabled: boolean;
  metaPixelEnabled: boolean;
}

export interface CookiePreferencesState {
  preferences: CookiePreferences;
  hasConsented: boolean;
  updatePreference: (type: keyof CookiePreferences, value: boolean) => void;
  setAllPreferences: (newPreferences: CookiePreferences) => void;
  acceptAll: () => void;
  rejectAll: () => void;
}

export const defaultCookiePreferences: CookiePreferences = {
  sessionAnalyticsEnabled: false,
  ga4Enabled: false,
  metaPixelEnabled: false
};
