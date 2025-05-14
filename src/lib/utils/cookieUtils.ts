
import Cookies from 'js-cookie';

/**
 * Check if the user has already given consent to cookies
 * @returns {boolean} True if consent was given, false otherwise
 */
export const getCookieConsentStatus = (): boolean => {
  const consent = Cookies.get('cookie_consent');
  return consent === 'true';
};

/**
 * Set the cookie consent status
 * @param {boolean} accepted - Whether consent was accepted
 */
export const setCookieConsentStatus = (accepted: boolean): void => {
  if (accepted) {
    // Set the consent cookie with a 1 year expiry
    Cookies.set('cookie_consent', 'true', { expires: 365 });
    
    // Also save to localStorage as a backup
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
  } else {
    // If rejected, we still set the cookie but with value 'false'
    // This prevents the banner from showing again
    Cookies.set('cookie_consent', 'false', { expires: 365 });
    localStorage.setItem('cookie_consent', 'false');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    
    // Remove any analytics cookies
    Cookies.remove('ga4_enabled');
    Cookies.remove('meta_pixel_enabled');
    Cookies.remove('session_analytics_enabled');
  }
};

/**
 * Get the full cookie preferences object
 * @returns {Object} Cookie preferences object
 */
export const getCookiePreferences = () => {
  const defaultPreferences = {
    ga4_enabled: false,
    meta_pixel_enabled: false,
    session_analytics_enabled: true,
    updated_at: new Date().toISOString()
  };
  
  try {
    // Try to get from localStorage first
    const storedPrefs = localStorage.getItem('cookie_preferences');
    
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
    
    // If not in localStorage, check individual cookies
    return {
      ga4_enabled: Cookies.get('ga4_enabled') === 'true',
      meta_pixel_enabled: Cookies.get('meta_pixel_enabled') === 'true',
      session_analytics_enabled: Cookies.get('session_analytics_enabled') !== 'false', // Default to true
      updated_at: localStorage.getItem('cookie_consent_date') || new Date().toISOString()
    };
  } catch (e) {
    console.error('Error getting cookie preferences:', e);
    return defaultPreferences;
  }
};

/**
 * Check if a specific cookie feature is enabled
 * @param {string} feature - The feature to check, e.g. 'ga4_enabled'
 * @returns {boolean} - Whether the feature is enabled
 */
export const isCookieFeatureEnabled = (feature: string): boolean => {
  // First check if consent was given at all
  if (!getCookieConsentStatus()) {
    return false;
  }
  
  // Then check the specific feature
  const prefs = getCookiePreferences();
  return prefs[feature as keyof typeof prefs] === true;
};

/**
 * Clear all cookies and localStorage related to cookie preferences
 */
export const clearCookiePreferences = (): void => {
  Cookies.remove('cookie_consent');
  Cookies.remove('ga4_enabled');
  Cookies.remove('meta_pixel_enabled');
  Cookies.remove('session_analytics_enabled');
  localStorage.removeItem('cookie_consent');
  localStorage.removeItem('cookie_consent_date');
  localStorage.removeItem('cookie_preferences');
};
