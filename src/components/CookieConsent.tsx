
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
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
  functional: boolean;
  marketing: boolean;
  analytics: boolean;
}

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    functional: true,
    marketing: false,
    analytics: false
  });

  // Check if user has already set cookie preferences
  useEffect(() => {
    const checkPreferences = async () => {
      if (!user || !currentTenant) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('cookie_preferences')
          .select('*')
          .eq('user_id', user.id)
          .eq('tenant_id', currentTenant.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // User has existing preferences
          setPreferences({
            functional: data.functional,
            marketing: data.marketing,
            analytics: data.analytics
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
  }, [user, currentTenant]);

  // Listen for external triggers to open the dialog
  useEffect(() => {
    const handleOpenPreferences = () => {
      setOpen(true);
    };
    
    window.addEventListener('open-cookie-preferences', handleOpenPreferences);
    
    return () => {
      window.removeEventListener('open-cookie-preferences', handleOpenPreferences);
    };
  }, []);

  const handleAcceptAll = async () => {
    if (!user || !currentTenant) return;
    
    const allEnabled = {
      functional: true,
      marketing: true,
      analytics: true
    };
    
    await savePreferences(allEnabled);
  };

  const handleRejectAll = async () => {
    if (!user || !currentTenant) return;
    
    const allMinimal = {
      functional: true, // Functional cookies are always enabled
      marketing: false,
      analytics: false
    };
    
    await savePreferences(allMinimal);
  };

  const handleSaveCustom = async () => {
    if (!user || !currentTenant) return;
    await savePreferences(preferences);
  };

  const savePreferences = async (prefs: CookiePreferences) => {
    if (!user || !currentTenant) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cookie_preferences')
        .upsert({
          user_id: user.id,
          tenant_id: currentTenant.id,
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
    // Allow closing if preferences are already saved
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
              <Label>{t('cookies.functional')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.functionalDesc')}
              </p>
            </div>
            <Switch
              checked={preferences.functional}
              disabled={true} // Functional cookies are always enabled
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('cookies.marketing')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.marketingDesc')}
              </p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, marketing: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('cookies.analytics')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.analyticsDesc')}
              </p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, analytics: checked })
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
