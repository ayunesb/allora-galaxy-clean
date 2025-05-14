
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CookiePreferenceItem from './CookiePreferenceItem';
import { useCookiePreferences, CookiePreference } from './useCookiePreferences';

interface CookieConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CookieConsentDialog: React.FC<CookieConsentDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    cookiePreferences, 
    setCookiePreferences, 
    acceptAllCookies, 
    acceptNecessaryCookies 
  } = useCookiePreferences();

  const handleAcceptAll = () => {
    acceptAllCookies();
    onOpenChange(false);
  };

  const handleAcceptNecessary = () => {
    acceptNecessaryCookies();
    onOpenChange(false);
  };

  const handleSavePreferences = () => {
    setCookiePreferences(cookiePreferences);
    onOpenChange(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreference, value: boolean) => {
    setCookiePreferences({
      ...cookiePreferences,
      [type]: value
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <div className="space-y-4 py-2">
          <h2 className="text-xl font-semibold">Cookie Preferences</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="preferences">Cookie Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 pt-4">
              <p>
                We use cookies to enhance your browsing experience, serve personalized ads or content,
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
              
              <div className="flex justify-between space-x-2">
                <Button variant="outline" onClick={handleAcceptNecessary}>
                  Necessary Only
                </Button>
                <Button onClick={handleAcceptAll}>Accept All</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4 pt-4">
              <CookiePreferenceItem
                title="Necessary Cookies"
                description="These cookies are required for the website to function and cannot be disabled."
                checked={cookiePreferences.necessary}
                disabled={true}
                onChange={() => {}}
              />
              
              <CookiePreferenceItem
                title="Analytics Cookies"
                description="These cookies help us understand how visitors interact with our website."
                checked={cookiePreferences.analytics}
                onChange={(checked) => handlePreferenceChange('analytics', checked)}
              />
              
              <CookiePreferenceItem
                title="Marketing Cookies"
                description="These cookies are used to track visitors across websites to display relevant advertisements."
                checked={cookiePreferences.marketing}
                onChange={(checked) => handlePreferenceChange('marketing', checked)}
              />
              
              <CookiePreferenceItem
                title="Preference Cookies"
                description="These cookies enable the website to remember choices you make."
                checked={cookiePreferences.preferences}
                onChange={(checked) => handlePreferenceChange('preferences', checked)}
              />
              
              <div className="flex justify-end">
                <Button onClick={handleSavePreferences}>Save Preferences</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsentDialog;
