
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getCookieConsentStatus, setCookieConsentStatus } from '@/lib/utils/cookieUtils';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = getCookieConsentStatus();
    
    if (!hasConsented) {
      // Show the cookie banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsentStatus(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setCookieConsentStatus(false);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-medium">We use cookies</h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              This website uses cookies to improve your experience. By continuing to use this site, you agree to our use of cookies.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDecline}>
              Decline
            </Button>
            <Button onClick={handleAccept}>
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
