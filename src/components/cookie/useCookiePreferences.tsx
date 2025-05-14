
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the user's cookie preferences when component mounts
  useEffect(() => {
    const fetchCookiePreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          
          // Fetch user's cookie preferences if they exist
          const { data, error } = await supabase
            .from('cookie_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (!error && data) {
            setPreferences({
              ga4_enabled: data.ga4_enabled || false,
              meta_pixel_enabled: data.meta_pixel_enabled || false,
              session_analytics_enabled: data.session_analytics_enabled || false
            });
          }
        }
      } catch (err) {
        console.error('Error fetching cookie preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCookiePreferences();
  }, []);
  
  // Update the user's cookie preferences
  const updatePreferences = async (newPreferences: Partial<CookiePreferences>) => {
    try {
      if (!userId) {
        // If no user is logged in, just update the local state
        setPreferences(prev => ({
          ...prev,
          ...newPreferences
        }));
        return { success: true };
      }
      
      // Update in database
      const { error } = await supabase
        .from('cookie_preferences')
        .upsert({
          user_id: userId,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state
      setPreferences(prev => ({
        ...prev,
        ...newPreferences
      }));
      
      return { success: true };
    } catch (err) {
      console.error('Error updating cookie preferences:', err);
      return { success: false, error: err };
    }
  };
  
  return {
    preferences,
    loading,
    updatePreferences,
    hasAccepted: Object.values(preferences).some(val => val === true)
  };
};

export default useCookiePreferences;
