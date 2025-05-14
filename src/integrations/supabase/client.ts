
import { createClient } from '@supabase/supabase-js';
import { getEnvWithDefault } from '@/lib/env';

// Get Supabase URL and key with hardcoded fallbacks to prevent blank screens
const supabaseUrl = getEnvWithDefault('VITE_SUPABASE_URL', 'https://ijrnwpgsqsxzqdemtknz.supabase.co');
const supabaseAnonKey = getEnvWithDefault('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo');

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
  },
});

// Export wrapper with error handler for convenience
export const supabaseWithErrorHandler = {
  from: (table: string) => {
    const client = supabase.from(table);
    
    // Enhanced error handling for common Supabase operations
    return {
      ...client,
      select: (...args: Parameters<typeof client.select>) => {
        try {
          return client.select(...args).throwOnError();
        } catch (error: any) {
          console.error('Database Error:', error.message || 'Failed to fetch data');
          throw error;
        }
      },
      insert: (...args: Parameters<typeof client.insert>) => {
        try {
          return client.insert(...args).throwOnError();
        } catch (error: any) {
          console.error('Database Insert Error:', error.message || 'Failed to insert data');
          throw error;
        }
      },
      update: (...args: Parameters<typeof client.update>) => {
        try {
          return client.update(...args).throwOnError();
        } catch (error: any) {
          console.error('Database Update Error:', error.message || 'Failed to update data');
          throw error;
        }
      },
      delete: (...args: Parameters<typeof client.delete>) => {
        try {
          return client.delete(...args).throwOnError();
        } catch (error: any) {
          console.error('Database Delete Error:', error.message || 'Failed to delete data');
          throw error;
        }
      },
      upsert: (...args: Parameters<typeof client.upsert>) => {
        try {
          return client.upsert(...args).throwOnError();
        } catch (error: any) {
          console.error('Database Upsert Error:', error.message || 'Failed to upsert data');
          throw error;
        }
      }
    };
  },
  rpc: (fn: string, params?: Record<string, any>) => {
    try {
      return supabase.rpc(fn, params).throwOnError();
    } catch (error: any) {
      console.error(`RPC Error (${fn}):`, error.message || 'Failed to execute RPC');
      throw error;
    }
  }
};
