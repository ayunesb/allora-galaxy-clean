
import { useState, useEffect } from 'react';
import { 
  getCookieConsentStatus,
  setCookieConsentStatus,
  DEFAULT_COOKIE_PREFERENCES,
  CookiePreferences
} from '@/lib/utils/cookieUtils';

/**
 * Hook to manage cookie consent preferences
 */
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_COOKIE_PREFERENCES);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  
  // Load preferences on mount
  useEffect(() => {
    const savedPreferences = getCookieConsentStatus();
    setPreferences(savedPreferences);
    
    // Check if user has explicitly consented before
    const hasExplicitConsent = Object.values(savedPreferences).some(value => value === true);
    setHasConsented(hasExplicitConsent);
  }, []);
  
  // Update a specific cookie preference
  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    const updatedPreferences = {
      ...preferences,
      [type]: value,
    };
    
    setPreferences(updatedPreferences);
    setCookieConsentStatus(updatedPreferences);
    setHasConsented(true);
  };
  
  // Set all preferences at once
  const setAllPreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    setCookieConsentStatus(newPreferences);
    setHasConsented(true);
  };
  
  // Accept all cookie types
  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    setPreferences(allAccepted);
    setCookieConsentStatus(allAccepted);
    setHasConsented(true);
  };
  
  // Reject all cookie types except necessary
  const rejectAll = () => {
    const allRejected = {
      necessary: true, // Necessary cookies are always enabled
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    setPreferences(allRejected);
    setCookieConsentStatus(allRejected);
    setHasConsented(true);
  };
  
  return {
    preferences,
    hasConsented,
    updatePreference,
    setAllPreferences,
    acceptAll,
    rejectAll,
  };
}
