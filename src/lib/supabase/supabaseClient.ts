
import { createClient } from '@supabase/supabase-js';
import { handleError, handleSupabaseError } from '@/lib/errors/ErrorHandler';
import { getEnvWithDefault } from '@/lib/env';

// Get Supabase URL and key with fallbacks to prevent blank screens
const supabaseUrl = getEnvWithDefault('VITE_SUPABASE_URL', 'https://ijrnwpgsqsxzqdemtknz.supabase.co');
const supabaseAnonKey = getEnvWithDefault('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo');

// Create Supabase client with consistent configuration
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

/**
 * Enhanced Supabase client with better error handling and retry logic
 */
export const enhancedSupabase = {
  from: (table: string) => {
    const client = supabase.from(table);
    
    return {
      ...client,
      select: async <T=any>(...args: Parameters<typeof client.select>): Promise<{data: T[] | null, error: any}> => {
        try {
          return await client.select(...args);
        } catch (error: any) {
          handleSupabaseError(error, { 
            context: { table, operation: 'select' },
            showNotification: true
          });
          return { data: null, error };
        }
      },
      
      getOne: async <T=any>(...args: Parameters<typeof client.select>): Promise<{data: T | null, error: any}> => {
        try {
          const { data, error } = await client.select(...args).maybeSingle();
          return { data: data as T, error };
        } catch (error: any) {
          handleSupabaseError(error, { 
            context: { table, operation: 'getOne' },
            showNotification: true
          });
          return { data: null, error };
        }
      },
      
      insert: async <T=any>(...args: Parameters<typeof client.insert>): Promise<{data: T[] | null, error: any}> => {
        try {
          return await client.insert(...args);
        } catch (error: any) {
          handleSupabaseError(error, { 
            context: { table, operation: 'insert' },
            showNotification: true
          });
          return { data: null, error };
        }
      },
      
      update: async <T=any>(...args: Parameters<typeof client.update>): Promise<{data: T[] | null, error: any}> => {
        try {
          return await client.update(...args);
        } catch (error: any) {
          handleSupabaseError(error, { 
            context: { table, operation: 'update' },
            showNotification: true
          });
          return { data: null, error };
        }
      },
      
      delete: async <T=any>(...args: Parameters<typeof client.delete>): Promise<{data: T[] | null, error: any}> => {
        try {
          return await client.delete(...args);
        } catch (error: any) {
          handleSupabaseError(error, { 
            context: { table, operation: 'delete' },
            showNotification: true
          });
          return { data: null, error };
        }
      },
      
      upsert: async <T=any>(...args: Parameters<typeof client.upsert>): Promise<{data: T[] | null, error: any}> => {
        try {
          return await client.upsert(...args);
        } catch (error: any) {
          handleSupabaseError(error, { 
            context: { table, operation: 'upsert' },
            showNotification: true
          });
          return { data: null, error };
        }
      }
    };
  },
  
  rpc: async <T=any>(fn: string, params?: Record<string, any>): Promise<{data: T | null, error: any}> => {
    try {
      return await supabase.rpc(fn, params);
    } catch (error: any) {
      handleSupabaseError(error, { 
        context: { function: fn },
        showNotification: true
      });
      return { data: null, error };
    }
  },
  
  auth: supabase.auth,
  storage: supabase.storage,
  functions: supabase.functions
};

// Create a retry wrapper for Supabase operations
export const createRetryableSupabaseClient = (options = {
  maxRetries: 3,
  retryDelay: 1000,
  onRetry: (attempt: number, error: any) => {},
}) => {
  const { maxRetries, retryDelay, onRetry } = options;
  
  const retryOperation = async <T>(operation: () => Promise<T>, attempts = 0): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      if (attempts >= maxRetries) {
        throw error;
      }
      
      // Call onRetry callback with attempt number and error
      onRetry(attempts + 1, error);
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 200;
      const delay = retryDelay * Math.pow(1.5, attempts) + jitter;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, attempts + 1);
    }
  };
  
  return {
    from: (table: string) => {
      const baseClient = supabase.from(table);
      
      return {
        ...baseClient,
        selectWithRetry: <T=any>(...args: Parameters<typeof baseClient.select>) => 
          retryOperation(() => baseClient.select<T>(...args)),
        insertWithRetry: <T=any>(...args: Parameters<typeof baseClient.insert>) => 
          retryOperation(() => baseClient.insert<T>(...args)),
        updateWithRetry: <T=any>(...args: Parameters<typeof baseClient.update>) => 
          retryOperation(() => baseClient.update<T>(...args)),
        deleteWithRetry: <T=any>(...args: Parameters<typeof baseClient.delete>) => 
          retryOperation(() => baseClient.delete<T>(...args)),
        upsertWithRetry: <T=any>(...args: Parameters<typeof baseClient.upsert>) => 
          retryOperation(() => baseClient.upsert<T>(...args)),
      };
    },
    
    rpcWithRetry: <T=any>(fn: string, params?: Record<string, any>) => 
      retryOperation(() => supabase.rpc<T>(fn, params))
  };
};

// Re-export the Supabase client types
export type { Session, User } from '@supabase/supabase-js';
