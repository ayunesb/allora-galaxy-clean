
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';

interface CookiePreferences {
  ga4_enabled: boolean;
  meta_pixel_enabled: boolean;
  session_analytics_enabled: boolean;
}

export const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    ga4_enabled: false,
    meta_pixel_enabled: false,
    session_analytics_enabled: false
  });
  const [loading, setLoading] = useState(true);
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
          ga4_enabled: data.ga4_enabled,
          meta_pixel_enabled: data.meta_pixel_enabled,
          session_analytics_enabled: data.session_analytics_enabled
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
      const updatedPrefs = {
        ...preferences,
        ...newPreferences
      };

      const { error } = await supabase
        .from('cookie_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPrefs,
          updated_at: new Date()
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

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  return {
    preferences,
    updatePreferences,
    loading,
    tenantId
  };
};

export default useCookiePreferences;
