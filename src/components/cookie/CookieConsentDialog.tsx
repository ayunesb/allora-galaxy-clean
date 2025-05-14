import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCookiePreferences } from "./useCookiePreferences";
import CookiePreferenceItem from "./CookiePreferenceItem";
import { CookiePreferences } from '@/types/cookiePreferences';

interface CookieConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookieConsentDialog({ open, onOpenChange }: CookieConsentDialogProps) {
  // Use our hook for cookie preferences
  const { 
    preferences, 
    hasConsented,
    updatePreference, 
    setAllPreferences,
    acceptAll, 
    rejectAll
  } = useCookiePreferences();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            We use cookies to improve your experience. Choose which cookies you want to allow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="necessary">Necessary Cookies</Label>
              <p className="text-sm text-muted-foreground">Required for the website to function. Cannot be disabled.</p>
            </div>
            <Switch id="necessary" checked disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground">Help us improve our website by collecting anonymous usage data.</p>
            </div>
            <Switch 
              id="analytics"
              checked={preferences.sessionAnalyticsEnabled}
              onCheckedChange={(checked) => updatePreference('sessionAnalyticsEnabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ga4">Google Analytics</Label>
              <p className="text-sm text-muted-foreground">Enables Google Analytics tracking for website usage statistics.</p>
            </div>
            <Switch 
              id="ga4"
              checked={preferences.ga4Enabled}
              onCheckedChange={(checked) => updatePreference('ga4Enabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="metaPixel">Meta Pixel</Label>
              <p className="text-sm text-muted-foreground">Enables Facebook/Meta tracking for advertising purposes.</p>
            </div>
            <Switch 
              id="metaPixel" 
              checked={preferences.metaPixelEnabled}
              onCheckedChange={(checked) => updatePreference('metaPixelEnabled', checked)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={rejectAll}>
            Reject All
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Save Preferences
            </Button>
            <Button onClick={acceptAll}>
              Accept All
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CookieConsentDialog;
