
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCookieConsentStatus, setCookieConsentStatus, getCookiePreferences, CookiePreferences } from '@/lib/utils';
import CookieConsentDialog from './cookie/CookieConsentDialog';

const CookieConsent: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(getCookieConsentStatus());

  // Listen for custom event to open cookie preferences dialog
  useEffect(() => {
    const handleOpenPreferences = () => setIsDialogOpen(true);
    window.addEventListener('open-cookie-preferences', handleOpenPreferences);
    return () => window.removeEventListener('open-cookie-preferences', handleOpenPreferences);
  }, []);

  const handleAccept = (preferences: CookiePreferences) => {
    setCookieConsentStatus(true, preferences);
    setHasConsent(true);
    setIsDialogOpen(false);
  };

  const handleDecline = () => {
    setCookieConsentStatus(false);
    setHasConsent(true);
    setIsDialogOpen(false);
  };

  // If user has already set cookie preferences, don't show the banner
  if (hasConsent) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              This website uses cookies to enhance your browsing experience.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(true)}>
              Preferences
            </Button>
            <Button variant="secondary" onClick={handleDecline}>
              Decline All
            </Button>
            <Button onClick={() => handleAccept({
              ga4Enabled: true,
              metaPixelEnabled: true,
              sessionAnalyticsEnabled: true
            })}>
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <CookieConsentDialog 
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAccept={handleAccept}
        onDecline={handleDecline}
        showDeclineButton={true}
      />
    </>
  );
};

export default CookieConsent;
