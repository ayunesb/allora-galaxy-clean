
import { createClient } from '@supabase/supabase-js';
import { toast } from "@/components/ui/use-toast";
import { getEnv } from '@/lib/env/envUtils';

// Get Supabase URL and key with hardcoded fallbacks to prevent blank screens
const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://ijrnwpgsqsxzqdemtknz.supabase.co');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'allora_auth_token',
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'allora-os',
    },
    fetch: (...args) => {
      // We can add request interceptors here if needed later
      return fetch(...args);
    },
  },
});

// Export wrapper with error handler for convenience
export const supabaseWithErrorHandler = {
  from: (table: string) => {
    const client = supabase.from(table);
    
    // You can add more methods as needed
    return {
      ...client,
      select: (...args: Parameters<typeof client.select>) => {
        try {
          return client.select(...args).throwOnError();
        } catch (error: any) {
          toast({
            title: 'Database Error',
            description: error.message || 'Failed to fetch data',
            variant: 'destructive',
          });
          throw error;
        }
      },
    };
  },
};
