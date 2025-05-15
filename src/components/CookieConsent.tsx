
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface CookieConsentProps {
  storageKey?: string;
  message?: string;
  acceptButtonLabel?: string;
  declineButtonLabel?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  className?: string;
}

const CookieConsent: React.FC<CookieConsentProps> = ({
  storageKey = 'cookieConsent',
  message = 'This website uses cookies to improve your experience. By using our site, you agree to our use of cookies.',
  acceptButtonLabel = 'Accept',
  declineButtonLabel = 'Decline',
  onAccept,
  onDecline,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const consent = localStorage.getItem(storageKey);
    setIsVisible(!consent);
  }, [storageKey]);

  const handleAccept = () => {
    localStorage.setItem(storageKey, 'accepted');
    setIsVisible(false);
    toast("Cookies Accepted", {
      description: "Thank you for accepting our use of cookies."
    });
    if (onAccept) {
      onAccept();
    }
  };

  const handleDecline = () => {
    localStorage.setItem(storageKey, 'declined');
    setIsVisible(false);
    toast("Cookies Declined", {
      description: "You have declined the use of cookies on this site."
    });
    if (onDecline) {
      onDecline();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn("fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-200 p-4 flex items-center justify-between z-50", className)}>
      <p className="text-sm text-gray-700">{message}</p>
      <div className="flex space-x-2">
        <Button size="sm" onClick={handleAccept}>{acceptButtonLabel}</Button>
        <Button variant="outline" size="sm" onClick={handleDecline}>{declineButtonLabel}</Button>
      </div>
    </div>
  );
};

export default CookieConsent;
