
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCookiePreferences } from './useCookiePreferences';

export const CookieConsentDialog: React.FC = () => {
  const { updatePreferences } = useCookiePreferences();
  const [open, setOpen] = useState(true);

  const handleAcceptAll = () => {
    updatePreferences({ analytics: true, marketing: true, necessary: true });
    setOpen(false);
  };

  const handleReject = () => {
    updatePreferences({ analytics: false, marketing: false, necessary: true });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Consent</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            We use cookies to enhance your experience on our site. By continuing to use this site,
            you consent to our use of cookies in accordance with our Cookie Policy.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReject}>
            Reject All
          </Button>
          <Button onClick={handleAcceptAll}>Accept All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
