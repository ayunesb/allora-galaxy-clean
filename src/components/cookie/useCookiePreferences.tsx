
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface CookiePreferences {
  functional: boolean;
  marketing: boolean;
  analytics: boolean;
}

export const useCookiePreferences = () => {
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

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    open, 
    setOpen,
    loading,
    preferences,
    updatePreference,
    handleAcceptAll,
    handleRejectAll,
    savePreferences
  };
};
