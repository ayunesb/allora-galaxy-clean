import { useState, useEffect, useCallback } from "react";
import { getCookie, setCookie } from "cookies-next";

export interface CookiePreferencesState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  updatePreferences: (prefs: {
    necessary?: boolean;
    analytics?: boolean;
    marketing?: boolean;
  }) => void;
}

const defaultPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export const useCookiePreferences = (): CookiePreferencesState => {
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const storedPreferences = getCookie("cookie_preferences");
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences as string));
      } catch (e) {
        console.error("Error parsing cookie preferences:", e);
        // If parsing fails, reset to default preferences
        setPreferences(defaultPreferences);
      }
    }
  }, []);

  const updatePreferences = useCallback(
    (prefs: {
      necessary?: boolean;
      analytics?: boolean;
      marketing?: boolean;
    }) => {
      const newPreferences = { ...preferences, ...prefs };
      setPreferences(newPreferences);
      setCookie("cookie_preferences", JSON.stringify(newPreferences), {
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    },
    [preferences],
  );

  return {
    ...preferences,
    updatePreferences,
  };
};
