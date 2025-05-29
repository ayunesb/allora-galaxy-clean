import Cookies from "js-cookie";

// Cookie names
export const COOKIE_CONSENT_NAME = "cookie_consent";

// Cookie consent types
export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

// Default cookie preferences (necessary cookies are always true)
export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

// Cookie options
export const COOKIE_OPTIONS = {
  expires: 365, // 1 year
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

/**
 * Get the current cookie consent status
 * @returns The current cookie preferences or the default if not set
 */
export function getCookieConsentStatus(): CookiePreferences {
  const consent = Cookies.get(COOKIE_CONSENT_NAME);

  if (!consent) {
    return DEFAULT_COOKIE_PREFERENCES;
  }

  try {
    const parsedConsent = JSON.parse(consent);
    return {
      ...DEFAULT_COOKIE_PREFERENCES,
      ...parsedConsent,
      necessary: true, // Always keep necessary cookies enabled
    };
  } catch (error) {
    console.error("Error parsing cookie consent:", error);
    return DEFAULT_COOKIE_PREFERENCES;
  }
}

/**
 * Set the cookie consent status
 * @param preferences Cookie preferences to save
 */
export function setCookieConsentStatus(preferences: CookiePreferences): void {
  // Always ensure necessary cookies are enabled
  const finalPreferences = {
    ...preferences,
    necessary: true,
  };

  Cookies.set(
    COOKIE_CONSENT_NAME,
    JSON.stringify(finalPreferences),
    COOKIE_OPTIONS as Cookies.CookieAttributes,
  );
}

/**
 * Check if a specific cookie type is allowed
 * @param type Cookie type to check
 * @returns Boolean indicating if the cookie type is allowed
 */
export function isCookieTypeAllowed(type: keyof CookiePreferences): boolean {
  const preferences = getCookieConsentStatus();
  return preferences[type] === true;
}

/**
 * Set a cookie only if the cookie type is allowed
 * @param name Cookie name
 * @param value Cookie value
 * @param type Cookie type
 * @param options Cookie options
 */
export function setConditionalCookie(
  name: string,
  value: string,
  type: keyof CookiePreferences,
  options: Cookies.CookieAttributes = {},
): boolean {
  if (isCookieTypeAllowed(type)) {
    Cookies.set(name, value, {
      ...COOKIE_OPTIONS,
      ...options,
    } as Cookies.CookieAttributes);
    return true;
  }
  return false;
}

/**
 * Clear all cookies except necessary ones
 */
export function clearNonEssentialCookies(): void {
  const preferences = getCookieConsentStatus();

  // Only keep the consent status cookie
  Object.keys(Cookies.get()).forEach((cookieName) => {
    if (cookieName !== COOKIE_CONSENT_NAME) {
      // Remove cookies that aren't explicitly allowed
      if (!preferences.necessary) {
        Cookies.remove(cookieName);
      }
    }
  });

  // Update the cookie preferences
  setCookieConsentStatus({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
}

// Ensure this is present and exported:
export function getCookiePreferences() {
  // Implement your logic or return a stub if needed
  return {};
}
