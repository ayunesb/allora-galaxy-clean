
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/context/workspace-context";

interface CookiePreferences {
  id?: string;
  user_id?: string;
  ga4_enabled?: boolean;
  meta_pixel_enabled?: boolean;
  session_analytics_enabled?: boolean;
  accepted_at?: string;
  updated_at?: string;
}

export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useWorkspaceContext() as any;

  useEffect(() => {
    async function fetchPreferences() {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("cookie_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        setPreferences(data);
      } catch (err) {
        console.error("Error fetching cookie preferences:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreferences();
  }, [user]);

  const updatePreferences = async (newPreferences: Partial<CookiePreferences>) => {
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error("User must be authenticated to update preferences");
      }

      const updates = {
        user_id: user.id,
        ...newPreferences,
        updated_at: new Date().toISOString(),
      };

      if (!preferences?.id) {
        updates.accepted_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("cookie_preferences")
        .upsert(updates)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      return data;
    } catch (err) {
      console.error("Error updating cookie preferences:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { preferences, isLoading, error, updatePreferences };
}
