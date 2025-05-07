
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CookiePreferences {
  ga4_enabled: boolean;
  meta_pixel_enabled: boolean;
  session_analytics_enabled: boolean;
}

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    ga4_enabled: false,
    meta_pixel_enabled: false,
    session_analytics_enabled: false
  });

  // Check if user has already set cookie preferences
  useEffect(() => {
    const checkPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('cookie_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // User has existing preferences
          setPreferences({
            ga4_enabled: data.ga4_enabled,
            meta_pixel_enabled: data.meta_pixel_enabled,
            session_analytics_enabled: data.session_analytics_enabled
          });
          setLoading(false);
        } else {
          // No preferences found, show the modal
          setOpen(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching cookie preferences:', error);
        setLoading(false);
      }
    };

    checkPreferences();
  }, [user]);

  const handleAcceptAll = async () => {
    if (!user) return;
    
    const allEnabled = {
      ga4_enabled: true,
      meta_pixel_enabled: true,
      session_analytics_enabled: true
    };
    
    await savePreferences(allEnabled);
  };

  const handleRejectAll = async () => {
    if (!user) return;
    
    const allDisabled = {
      ga4_enabled: false,
      meta_pixel_enabled: false,
      session_analytics_enabled: false
    };
    
    await savePreferences(allDisabled);
  };

  const handleSaveCustom = async () => {
    if (!user) return;
    await savePreferences(preferences);
  };

  const savePreferences = async (prefs: CookiePreferences) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cookie_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setPreferences(prefs);
      setOpen(false);
      toast({
        title: t('cookies.preferencesUpdated'),
        description: t('cookies.preferencesUpdatedDesc'),
      });
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      toast({
        title: t('cookies.errorSaving'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Only allow closing if preferences are already saved
    if (user && !open) {
      // Don't let users close the dialog without making a choice
      return;
    }
    setOpen(open);
  };

  if (loading || !user) {
    return null; // Don't show anything while loading or if no user
  }

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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('cookies.googleAnalytics')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.googleAnalyticsDesc')}
              </p>
            </div>
            <Switch
              checked={preferences.ga4_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, ga4_enabled: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('cookies.metaPixel')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.metaPixelDesc')}
              </p>
            </div>
            <Switch
              checked={preferences.meta_pixel_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, meta_pixel_enabled: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('cookies.sessionAnalytics')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.sessionAnalyticsDesc')}
              </p>
            </div>
            <Switch
              checked={preferences.session_analytics_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, session_analytics_enabled: checked })
              }
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleRejectAll}
            disabled={loading}
          >
            {t('cookies.rejectAll')}
          </Button>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveCustom}
              disabled={loading}
            >
              {t('cookies.saveCustom')}
            </Button>
            <Button
              type="button"
              onClick={handleAcceptAll}
              disabled={loading}
            >
              {t('cookies.acceptAll')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsent;
