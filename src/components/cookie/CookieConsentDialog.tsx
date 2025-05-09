
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import CookiePreferenceItem from "./CookiePreferenceItem";

export interface CookiePreferences {
  ga4Enabled: boolean;
  metaPixelEnabled: boolean;
  sessionAnalyticsEnabled: boolean;
}

export interface CookieConsentDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
  initialPreferences?: CookiePreferences;
  showDeclineButton?: boolean;
}

export const CookieConsentDialog: React.FC<CookieConsentDialogProps> = ({
  open,
  onClose,
  onAccept,
  onDecline,
  initialPreferences = {
    ga4Enabled: false,
    metaPixelEnabled: false,
    sessionAnalyticsEnabled: true,
  },
  showDeclineButton = true,
}) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(initialPreferences);

  const handleAcceptAll = () => {
    onAccept({
      ga4Enabled: true,
      metaPixelEnabled: true,
      sessionAnalyticsEnabled: true,
    });
  };

  const handleAcceptSelected = () => {
    onAccept(preferences);
  };

  const handleToggleGA4 = (checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      ga4Enabled: checked,
    }));
  };

  const handleToggleMetaPixel = (checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      metaPixelEnabled: checked,
    }));
  };

  const handleToggleSessionAnalytics = (checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      sessionAnalyticsEnabled: checked,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Cookie Preferences</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="essential">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="essential">Essential</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="essential" className="py-4 space-y-4">
            <CookiePreferenceItem
              title="Necessary Cookies"
              description="These cookies are required for the application to function and cannot be disabled."
              checked={true}
              disabled={true}
              onChange={() => {}}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="py-4 space-y-4">
            <CookiePreferenceItem
              title="Session Analytics"
              description="We use these cookies to analyze how visitors use our website."
              checked={preferences.sessionAnalyticsEnabled}
              onChange={handleToggleSessionAnalytics}
            />
            
            <CookiePreferenceItem
              title="Google Analytics"
              description="We use Google Analytics to understand how visitors interact with our website."
              checked={preferences.ga4Enabled}
              onChange={handleToggleGA4}
            />
          </TabsContent>
          
          <TabsContent value="marketing" className="py-4 space-y-4">
            <CookiePreferenceItem
              title="Meta Pixel"
              description="Meta Pixel helps us measure the effectiveness of our advertising."
              checked={preferences.metaPixelEnabled}
              onChange={handleToggleMetaPixel}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {showDeclineButton && (
            <Button variant="outline" onClick={onDecline} className="sm:mr-auto">
              Decline All
            </Button>
          )}
          <Button variant="outline" onClick={handleAcceptSelected}>
            Save Preferences
          </Button>
          <Button onClick={handleAcceptAll}>
            Accept All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsentDialog;
