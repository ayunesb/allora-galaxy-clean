
import { Cookies } from "js-cookie";

/**
 * Cookie preferences data structure
 */
export interface CookiePreferences {
  ga4Enabled?: boolean;
  metaPixelEnabled?: boolean;
  sessionAnalyticsEnabled?: boolean;
}

/**
 * Check if user has set cookie preferences
 * @returns boolean indicating consent status
 */
export function getCookieConsentStatus(): boolean {
  try {
    const cookieConsent = localStorage.getItem('cookie-consent');
    return cookieConsent === 'true' || cookieConsent === 'false';
  } catch (e) {
    // If localStorage is not available (e.g. in SSR or private browsing)
    return false;
  }
}

/**
 * Set cookie consent preferences
 * @param accepted - Whether cookies are accepted
 * @param preferences - Specific cookie preferences if accepted
 */
export function setCookieConsentStatus(accepted: boolean, preferences?: CookiePreferences): void {
  try {
    localStorage.setItem('cookie-consent', String(accepted));
    
    if (accepted && preferences) {
      localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    } else {
      localStorage.removeItem('cookie-preferences');
    }
    
    // Set cookie expiration to 365 days
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  } catch (e) {
    console.error('Error setting cookie preferences:', e);
  }
}

/**
 * Get user's cookie preferences
 * @returns The stored cookie preferences or default values
 */
export function getCookiePreferences(): CookiePreferences {
  const defaultPreferences: CookiePreferences = {
    ga4Enabled: false,
    metaPixelEnabled: false,
    sessionAnalyticsEnabled: false
  };
  
  try {
    const storedPreferences = localStorage.getItem('cookie-preferences');
    if (storedPreferences) {
      return JSON.parse(storedPreferences);
    }
  } catch (e) {
    console.error('Error reading cookie preferences:', e);
  }
  
  return defaultPreferences;
}
