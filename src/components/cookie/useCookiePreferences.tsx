
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from '@/components/ui/use-toast';

export interface CookiePreferences {
  ga4_enabled: boolean;
  meta_pixel_enabled: boolean;
  session_analytics_enabled: boolean;
  functional: boolean;
  marketing: boolean;
  analytics: boolean;
}

export const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    ga4_enabled: false,
    meta_pixel_enabled: false,
    session_analytics_enabled: false,
    functional: true, // Essential cookies are always enabled
    marketing: false,
    analytics: false
  });
  
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const tenantId = currentWorkspace?.id;

  const fetchPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cookie_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cookie preferences:', error);
      } else if (data) {
        setPreferences({
          ga4_enabled: !!data.ga4_enabled,
          meta_pixel_enabled: !!data.meta_pixel_enabled,
          session_analytics_enabled: !!data.session_analytics_enabled,
          functional: true, // Essential cookies are always enabled
          marketing: !!data.meta_pixel_enabled,
          analytics: !!(data.ga4_enabled || data.session_analytics_enabled)
        });
      }
    } catch (error) {
      console.error('Error in useCookiePreferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<CookiePreferences>) => {
    if (!user) return;

    try {
      // Map the UI preferences back to database fields
      const dbPreferences = {
        ga4_enabled: newPreferences.analytics ?? preferences.ga4_enabled,
        meta_pixel_enabled: newPreferences.marketing ?? preferences.meta_pixel_enabled,
        session_analytics_enabled: newPreferences.analytics ?? preferences.session_analytics_enabled
      };

      const updatedPrefs = {
        ...preferences,
        ...newPreferences,
        // If we're explicitly setting analytics/marketing, update the underlying specific settings
        ...(newPreferences.analytics !== undefined ? { 
          ga4_enabled: !!newPreferences.analytics,
          session_analytics_enabled: !!newPreferences.analytics 
        } : {}),
        ...(newPreferences.marketing !== undefined ? { 
          meta_pixel_enabled: !!newPreferences.marketing 
        } : {})
      };

      const { error } = await supabase
        .from('cookie_preferences')
        .upsert({
          user_id: user.id,
          ...dbPreferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      setPreferences(updatedPrefs);
      return true;
    } catch (error) {
      console.error('Error updating cookie preferences:', error);
      return false;
    }
  };

  // Update a single preference
  const updatePreference = useCallback((key: keyof CookiePreferences, value: boolean) => {
    updatePreferences({ [key]: value });
  }, []);

  // Accept all cookies
  const handleAcceptAll = useCallback(async () => {
    const allEnabled = {
      functional: true,
      marketing: true,
      analytics: true
    };
    
    const success = await updatePreferences(allEnabled);
    
    if (success) {
      setOpen(false);
      toast({
        title: "All cookies accepted",
        description: "Thank you for accepting all cookies.",
      });
    }
  }, []);

  // Reject all cookies except functional
  const handleRejectAll = useCallback(async () => {
    const allDisabled = {
      functional: true, // Essential cookies are always enabled
      marketing: false,
      analytics: false
    };
    
    const success = await updatePreferences(allDisabled);
    
    if (success) {
      setOpen(false);
      toast({
        title: "Cookie preferences saved",
        description: "Only essential cookies are enabled.",
      });
    }
  }, []);

  // Save current preferences
  const savePreferences = useCallback(async () => {
    const success = await updatePreferences(preferences);
    
    if (success) {
      setOpen(false);
      toast({
        title: "Cookie preferences saved",
        description: "Your cookie preferences have been updated.",
      });
    }
  }, [preferences]);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  return {
    preferences,
    updatePreferences,
    loading,
    tenantId,
    open,
    setOpen,
    updatePreference,
    handleAcceptAll,
    handleRejectAll,
    savePreferences
  };
};

export default useCookiePreferences;
