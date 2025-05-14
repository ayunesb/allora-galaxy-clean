
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/notifications/toast';
import { useSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Cookies from 'js-cookie';

interface CookiePreferences {
  ga4_enabled: boolean;
  meta_pixel_enabled: boolean;
  session_analytics_enabled: boolean;
  updated_at?: string;
}

export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    ga4_enabled: false,
    meta_pixel_enabled: false,
    session_analytics_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const { user } = useAuth();

  // Load cookie preferences from localStorage or database
  const loadPreferences = useCallback(async () => {
    setLoading(true);
    
    try {
      // First check if we have preferences in localStorage
      const localPrefs = localStorage.getItem('cookie_preferences');
      
      if (localPrefs) {
        setPreferences(JSON.parse(localPrefs));
      }
      
      // If user is authenticated, load preferences from database
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_cookie_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error loading cookie preferences:', error);
        } else if (data) {
          // Transform database data into our preferences format
          setPreferences({
            ga4_enabled: data.ga4_enabled,
            meta_pixel_enabled: data.meta_pixel_enabled,
            session_analytics_enabled: data.session_analytics_enabled,
            updated_at: data.updated_at,
          });
          
          // Update localStorage
          localStorage.setItem('cookie_preferences', JSON.stringify({
            ga4_enabled: data.ga4_enabled,
            meta_pixel_enabled: data.meta_pixel_enabled,
            session_analytics_enabled: data.session_analytics_enabled,
            updated_at: data.updated_at,
          }));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.id]);

  // Save preferences to localStorage and database
  const savePreferences = useCallback(async (newPrefs: CookiePreferences) => {
    setLoading(true);
    
    try {
      // Update state
      setPreferences(newPrefs);
      
      // Update localStorage
      localStorage.setItem('cookie_preferences', JSON.stringify(newPrefs));
      
      // Set main consent cookie
      Cookies.set('cookie_consent', 'true', { expires: 365 });
      
      // Set individual feature cookies
      if (newPrefs.ga4_enabled) {
        Cookies.set('ga4_enabled', 'true', { expires: 365 });
      } else {
        Cookies.remove('ga4_enabled');
      }
      
      if (newPrefs.meta_pixel_enabled) {
        Cookies.set('meta_pixel_enabled', 'true', { expires: 365 });
      } else {
        Cookies.remove('meta_pixel_enabled');
      }
      
      if (newPrefs.session_analytics_enabled) {
        Cookies.set('session_analytics_enabled', 'true', { expires: 365 });
      } else {
        Cookies.remove('session_analytics_enabled');
      }
      
      // If user is authenticated, save to database
      if (user?.id) {
        const { error } = await supabase
          .from('user_cookie_preferences')
          .upsert({
            user_id: user.id,
            ga4_enabled: newPrefs.ga4_enabled,
            meta_pixel_enabled: newPrefs.meta_pixel_enabled,
            session_analytics_enabled: newPrefs.session_analytics_enabled,
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error saving cookie preferences:', error);
          toast({
            title: 'Error',
            description: 'Failed to save your cookie preferences.',
            variant: 'destructive',
          });
          return false;
        }
      }
      
      toast({
        title: 'Cookie preferences updated',
        description: 'Your cookie preferences have been saved.',
      });
      
      return true;
    } catch (error) {
      console.error('Error in savePreferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your cookie preferences.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.id, toast]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    savePreferences,
    loading,
    reloadPreferences: loadPreferences
  };
}

export default useCookiePreferences;
