export interface CookiePreferencesState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  setConsent: (type: string, value: boolean) => void;
  hasShownCookieDialog: boolean;
  setHasShownCookieDialog: (value: boolean) => void;
}
