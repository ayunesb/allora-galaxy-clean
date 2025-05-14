
import { useState, useEffect } from 'react';
import { CookiePreferences, CookiePreferencesState, defaultCookiePreferences } from '@/types/cookiePreferences';
import { getCookie, setCookie } from '@/lib/utils/cookies';

const COOKIE_NAME = 'cookie-preferences';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Hook to manage cookie preferences
 */
export function useCookiePreferences(): CookiePreferencesState {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultCookiePreferences);
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  // Load preferences from cookie on mount
  useEffect(() => {
    const savedPreferences = getCookie<CookiePreferences>(COOKIE_NAME);
    if (savedPreferences) {
      setPreferences(savedPreferences);
      setHasConsented(true);
    }
  }, []);

  // Update a single preference
  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    const newPreferences = { ...preferences, [type]: value };
    setPreferences(newPreferences);
    setCookie(COOKIE_NAME, newPreferences, COOKIE_MAX_AGE);
    setHasConsented(true);
  };

  // Set all preferences at once
  const setAllPreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    setCookie(COOKIE_NAME, newPreferences, COOKIE_MAX_AGE);
    setHasConsented(true);
  };

  // Accept all cookies
  const acceptAll = () => {
    const allEnabled: CookiePreferences = {
      sessionAnalyticsEnabled: true,
      ga4Enabled: true,
      metaPixelEnabled: true
    };
    setPreferences(allEnabled);
    setCookie(COOKIE_NAME, allEnabled, COOKIE_MAX_AGE);
    setHasConsented(true);
  };

  // Reject all optional cookies
  const rejectAll = () => {
    const allDisabled: CookiePreferences = {
      sessionAnalyticsEnabled: false,
      ga4Enabled: false,
      metaPixelEnabled: false
    };
    setPreferences(allDisabled);
    setCookie(COOKIE_NAME, allDisabled, COOKIE_MAX_AGE);
    setHasConsented(true);
  };

  return {
    preferences,
    hasConsented,
    updatePreference,
    setAllPreferences,
    acceptAll,
    rejectAll
  };
}
