
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CookiePreferenceItem from './CookiePreferenceItem';
import { CookiePreferences } from '@/lib/utils';

interface CookieConsentDialogProps {
  open: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
  showDeclineButton?: boolean;
}

const CookieConsentDialog: React.FC<CookieConsentDialogProps> = ({
  open,
  onClose,
  onOpenChange,
  onAccept,
  onDecline,
  showDeclineButton = true,
}) => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    ga4Enabled: true,
    metaPixelEnabled: true,
    sessionAnalyticsEnabled: true
  });

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleAcceptSelected = () => {
    onAccept(preferences);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        if (onOpenChange) onOpenChange(open);
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="information">Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences" className="space-y-4 py-4">
            <CookiePreferenceItem
              title="Necessary"
              description="Essential cookies required for basic site functionality."
              checked={true}
              disabled={true}
              onChange={() => {}}
            />
            
            <CookiePreferenceItem
              title="Google Analytics"
              description="Helps us understand how visitors interact with our website."
              checked={preferences.ga4Enabled}
              onChange={(checked) => handlePreferenceChange('ga4Enabled', checked)}
            />
            
            <CookiePreferenceItem
              title="Meta Pixel"
              description="Helps us measure the effectiveness of our advertising."
              checked={preferences.metaPixelEnabled}
              onChange={(checked) => handlePreferenceChange('metaPixelEnabled', checked)}
            />
            
            <CookiePreferenceItem
              title="Session Analytics"
              description="Tracks user session data to improve user experience."
              checked={preferences.sessionAnalyticsEnabled}
              onChange={(checked) => handlePreferenceChange('sessionAnalyticsEnabled', checked)}
            />
          </TabsContent>
          
          <TabsContent value="information" className="py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">What are cookies?</h3>
              <p className="text-sm text-muted-foreground">
                Cookies are small text files that are placed on your device to help the site provide a better user experience. 
                In general, cookies are used to retain user preferences, store information for things like shopping carts, 
                and provide anonymized tracking data to third-party applications like Google Analytics.
              </p>
              <p className="text-sm text-muted-foreground">
                As a rule, cookies will make your browsing experience better. However, you may prefer to disable cookies on 
                this site and on others. The most effective way to do this is to disable cookies in your browser.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {showDeclineButton && (
            <Button variant="outline" onClick={onDecline} className="sm:w-auto w-full">
              Decline All
            </Button>
          )}
          <div className="flex gap-2 sm:w-auto w-full">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleAcceptSelected}
            >
              Accept Selected
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => onAccept({
                ga4Enabled: true,
                metaPixelEnabled: true,
                sessionAnalyticsEnabled: true
              })}
            >
              Accept All
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsentDialog;
