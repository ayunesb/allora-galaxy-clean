
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CookiePreferenceItem } from './CookiePreferenceItem';

export interface CookiePreferences {
  ga4Enabled: boolean;
  metaPixelEnabled: boolean;
  sessionAnalyticsEnabled: boolean;
}

interface CookieConsentDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
  preferences: CookiePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<CookiePreferences>>;
}

export const CookieConsentDialog: React.FC<CookieConsentDialogProps> = ({
  open,
  onClose,
  onAccept,
  onDecline,
  preferences,
  setPreferences
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Choose which cookies you want to allow on our site. We use cookies to provide essential functionality, analyze usage, and enhance your experience. Your choices can be changed at any time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <CookiePreferenceItem
            id="essential-cookies"
            title="Essential Cookies"
            description="These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services."
            checked={true}
            disabled={true}
            onChange={() => {}}
          />
          <CookiePreferenceItem
            id="ga4-cookies"
            title="Google Analytics (GA4)"
            description="These cookies help us analyze how visitors use our site, which pages are popular, and where users come from."
            checked={preferences.ga4Enabled}
            onChange={(checked) => setPreferences(prev => ({...prev, ga4Enabled: checked}))}
          />
          <CookiePreferenceItem
            id="meta-cookies"
            title="Meta Pixel"
            description="These cookies help us track conversions from Meta ads, optimize ads, build targeted audiences, and remarket to users."
            checked={preferences.metaPixelEnabled}
            onChange={(checked) => setPreferences(prev => ({...prev, metaPixelEnabled: checked}))}
          />
          <CookiePreferenceItem
            id="session-cookies"
            title="Session Analytics"
            description="These cookies collect information about how you use our website, which pages you visited and which links you clicked on."
            checked={preferences.sessionAnalyticsEnabled}
            onChange={(checked) => setPreferences(prev => ({...prev, sessionAnalyticsEnabled: checked}))}
          />
        </div>
        <DialogFooter>
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
            <Button
              variant="outline"
              onClick={onDecline}
            >
              Decline All
            </Button>
            <Button 
              variant="default"
              onClick={() => onAccept(preferences)}
            >
              Accept Selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsentDialog;
