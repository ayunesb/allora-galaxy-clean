
import { useState, useEffect } from 'react';
import { getCookieConsentStatus, setCookieConsentStatus } from '@/lib/utils/cookieUtils';
import Cookies from 'js-cookie';

export type CookiePreference = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

export function useCookiePreferences() {
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreference>({
    necessary: true, // Necessary cookies are always required
    analytics: false,
    marketing: false,
    preferences: false
  });

  // Load cookie preferences on component mount
  useEffect(() => {
    const savedPreferences = getCookieConsentStatus();
    if (savedPreferences) {
      setCookiePreferences(prev => ({
        ...prev,
        ...savedPreferences
      }));
    }
  }, []);

  // Function to save cookie preferences
  const saveCookiePreferences = (preferences: CookiePreference) => {
    setCookieConsentStatus(preferences);
    setCookiePreferences(preferences);
  };

  // Accept all cookies
  const acceptAllCookies = () => {
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    saveCookiePreferences(preferences);
  };

  // Accept only necessary cookies
  const acceptNecessaryCookies = () => {
    const preferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    saveCookiePreferences(preferences);
  };

  // Check if all cookie types are allowed
  const hasFullConsent = (): boolean => {
    return (
      cookiePreferences.necessary &&
      cookiePreferences.analytics &&
      cookiePreferences.marketing &&
      cookiePreferences.preferences
    );
  };

  // Update individual cookie preference
  const updateCookiePreference = (type: keyof CookiePreference, value: boolean) => {
    setCookiePreferences(prev => {
      const updatedPrefs = { ...prev, [type]: value };
      setCookieConsentStatus(updatedPrefs);
      return updatedPrefs;
    });
  };

  return {
    cookiePreferences,
    setCookiePreferences: saveCookiePreferences,
    acceptAllCookies,
    acceptNecessaryCookies,
    hasFullConsent,
    updateCookiePreference
  };
}
