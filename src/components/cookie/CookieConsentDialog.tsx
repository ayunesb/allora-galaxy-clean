
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import CookiePreferenceItem from './CookiePreferenceItem';
import CookiePreferenceFooter from './CookiePreferenceFooter';
import { useCookiePreferences, CookiePreferences } from './useCookiePreferences';

const CookieConsentDialog: React.FC = () => {
  const { t } = useTranslation();
  const {
    open,
    setOpen,
    loading,
    preferences,
    updatePreference,
    handleAcceptAll,
    handleRejectAll,
    savePreferences
  } = useCookiePreferences();

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  const handleOpenChange = (open: boolean) => {
    // Allow closing if preferences are already saved
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('cookies.title')}</DialogTitle>
          <DialogDescription>
            {t('cookies.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <CookiePreferenceItem
            id="functional-cookies"
            title={t('cookies.functional')}
            description={t('cookies.functionalDesc')}
            checked={preferences.functional}
            disabled={true} // Functional cookies are always enabled
          />
          <CookiePreferenceItem
            id="marketing-cookies"
            title={t('cookies.marketing')}
            description={t('cookies.marketingDesc')}
            checked={preferences.marketing}
            onCheckedChange={(checked) => updatePreference('marketing', checked)}
          />
          <CookiePreferenceItem
            id="analytics-cookies"
            title={t('cookies.analytics')}
            description={t('cookies.analyticsDesc')}
            checked={preferences.analytics}
            onCheckedChange={(checked) => updatePreference('analytics', checked)}
          />
        </div>
        <CookiePreferenceFooter
          loading={loading}
          onRejectAll={handleRejectAll}
          onSaveCustom={handleSaveCustom}
          onAcceptAll={handleAcceptAll}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsentDialog;
