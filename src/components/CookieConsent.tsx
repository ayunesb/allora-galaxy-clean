
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCookiePreferences } from './cookie/useCookiePreferences';
import { CookieConsentDialog } from './cookie/CookieConsentDialog';
import { defaultCookiePreferences } from '@/types/cookiePreferences';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { hasConsented, acceptAll, rejectAll } = useCookiePreferences();

  // Show the banner if the user hasn't consented yet
  useEffect(() => {
    // Small delay to prevent flash on initial load
    const timer = setTimeout(() => {
      setShowBanner(!hasConsented);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [hasConsented]);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm">
              This website uses cookies to improve your experience. By using this site, you agree to our use of cookies.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowDialog(true)} size="sm">
              Customize
            </Button>
            <Button variant="secondary" onClick={handleRejectAll} size="sm">
              Reject All
            </Button>
            <Button onClick={handleAcceptAll} size="sm">
              Accept All
            </Button>
          </div>
        </div>
      </div>
      
      <CookieConsentDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}

export default CookieConsent;
