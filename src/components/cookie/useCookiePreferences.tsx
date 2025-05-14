
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CookiePreference {
  id?: string;
  user_id?: string;
  accepted_at?: string;
  updated_at?: string;
  ga4_enabled?: boolean;
  meta_pixel_enabled?: boolean;
  session_analytics_enabled?: boolean;
}

export interface CookiePreferencesState {
  settings: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  isLoaded: boolean;
  hasAccepted: boolean;
  showBanner: boolean;
  acceptAll: () => Promise<void>;
  acceptSelected: () => Promise<void>;
  rejectAll: () => Promise<void>;
  updatePreference: (category: string, value: boolean) => void;
  togglePreference: (category: string) => void;
}

const defaultPreferences = {
  essential: true, // Essential cookies are always enabled
  analytics: false,
  marketing: false
};

export const useCookiePreferences = (): CookiePreferencesState => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [preferences, setPreferences] = useState({
    ...defaultPreferences
  });
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Load preferences from localStorage or database
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Check if preferences exist in localStorage
        const localPrefs = localStorage.getItem('cookiePreferences');
        
        if (localPrefs) {
          const parsed = JSON.parse(localPrefs);
          setPreferences(prev => ({
            ...prev,
            analytics: parsed.analytics || false,
            marketing: parsed.marketing || false
          }));
          setHasAccepted(true);
          setShowBanner(false);
        } else if (user) {
          // If user is logged in and no local prefs, check database
          const { data, error } = await supabase
            .from('cookie_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error loading cookie preferences:', error);
          } else if (data) {
            setPreferences(prev => ({
              ...prev,
              analytics: data.session_analytics_enabled || false,
              marketing: data.meta_pixel_enabled || false
            }));
            setHasAccepted(true);
            setShowBanner(false);
          }
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load cookie preferences', error);
        setIsLoaded(true);
      }
    };
    
    loadPreferences();
  }, [user]);

  // Save preferences
  const savePreferences = async (prefs: typeof preferences) => {
    try {
      // Save to local storage
      localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
      
      // If user is logged in, save to database
      if (user) {
        const { error } = await supabase
          .from('cookie_preferences')
          .upsert({
            user_id: user.id,
            session_analytics_enabled: prefs.analytics,
            meta_pixel_enabled: prefs.marketing,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (error) throw error;
      }
      
      toast({
        title: 'Preferences saved',
        description: 'Your cookie preferences have been updated.',
      });
      
      return true;
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const acceptAll = async () => {
    const newPrefs = {
      ...preferences,
      analytics: true,
      marketing: true
    };
    
    const success = await savePreferences(newPrefs);
    
    if (success) {
      setPreferences(newPrefs);
      setHasAccepted(true);
      setShowBanner(false);
      toast({
        title: 'Cookies accepted',
        description: 'You have accepted all cookies.',
      });
    }
  };

  const acceptSelected = async () => {
    const success = await savePreferences(preferences);
    
    if (success) {
      setHasAccepted(true);
      setShowBanner(false);
    }
  };

  const rejectAll = async () => {
    const newPrefs = {
      ...defaultPreferences
    };
    
    const success = await savePreferences(newPrefs);
    
    if (success) {
      setPreferences(newPrefs);
      setHasAccepted(true);
      setShowBanner(false);
    }
  };

  const updatePreference = (category: string, value: boolean) => {
    if (category === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const togglePreference = (category: string) => {
    if (category === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category as keyof typeof prev]
    }));
  };

  return {
    settings: preferences,
    isLoaded,
    hasAccepted,
    showBanner,
    acceptAll,
    acceptSelected,
    rejectAll,
    updatePreference,
    togglePreference
  };
};

export default useCookiePreferences;
