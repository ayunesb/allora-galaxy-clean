
import { supabase } from './client';
import { handleSupabaseError } from '@/lib/errors/ErrorHandler';
import { withRetry } from '@/lib/errors/retryUtils';

type FunctionInvokeOptions = {
  body?: object;
  headers?: Record<string, string>;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
};

/**
 * Create a wrapper around Supabase client with built-in error handling
 */
export const supabaseWithErrorHandling = {
  /**
   * Wrap Supabase table operations with error handling
   */
  from: (table: string) => {
    const client = supabase.from(table);
    
    return {
      // Pass through the original client
      ...client,
      
      /**
       * Select with error handling
       */
      select: (...args: Parameters<typeof client.select>) => {
        return client.select(...args)
          .then(({ data, error }) => {
            if (error) {
              throw handleSupabaseError(error, {
                context: { table, operation: 'select', args },
              });
            }
            return { data, error: null };
          });
      },
      
      /**
       * Select single with error handling
       */
      selectSingle: async (...args: Parameters<typeof client.select>) => {
        const { data, error } = await client.select(...args).single();
        
        if (error) {
          throw handleSupabaseError(error, {
            context: { table, operation: 'selectSingle', args },
          });
        }
        
        return { data, error: null };
      },
      
      /**
       * Select maybe single with error handling
       */
      selectMaybeSingle: async (...args: Parameters<typeof client.select>) => {
        const { data, error } = await client.select(...args).maybeSingle();
        
        if (error) {
          throw handleSupabaseError(error, {
            context: { table, operation: 'selectMaybeSingle', args },
          });
        }
        
        return { data, error: null };
      },
      
      /**
       * Insert with error handling
       */
      insert: (...args: Parameters<typeof client.insert>) => {
        return client.insert(...args)
          .then(({ data, error }) => {
            if (error) {
              throw handleSupabaseError(error, {
                context: { table, operation: 'insert', args },
              });
            }
            return { data, error: null };
          });
      },
      
      /**
       * Update with error handling
       */
      update: (...args: Parameters<typeof client.update>) => {
        return client.update(...args)
          .then(({ data, error }) => {
            if (error) {
              throw handleSupabaseError(error, {
                context: { table, operation: 'update', args },
              });
            }
            return { data, error: null };
          });
      },
      
      /**
       * Delete with error handling
       */
      delete: (...args: Parameters<typeof client.delete>) => {
        return client.delete(...args)
          .then(({ data, error }) => {
            if (error) {
              throw handleSupabaseError(error, {
                context: { table, operation: 'delete', args },
              });
            }
            return { data, error: null };
          });
      },
      
      /**
       * Upsert with error handling
       */
      upsert: (...args: Parameters<typeof client.upsert>) => {
        return client.upsert(...args)
          .then(({ data, error }) => {
            if (error) {
              throw handleSupabaseError(error, {
                context: { table, operation: 'upsert', args },
              });
            }
            return { data, error: null };
          });
      },
    };
  },
  
  /**
   * RPC with error handling
   */
  rpc: (fn: string, params?: Record<string, any>) => {
    return supabase.rpc(fn, params)
      .then(({ data, error }) => {
        if (error) {
          throw handleSupabaseError(error, {
            context: { rpc: fn, params },
          });
        }
        return { data, error: null };
      });
  },
  
  /**
   * Auth with additional error handling
   */
  auth: {
    ...supabase.auth,
    
    /**
     * Sign in with improved error handling
     */
    signIn: async (credentials: {
      email: string;
      password: string;
    }) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        
        if (error) {
          throw handleSupabaseError(error, {
            context: { operation: 'signIn', email: credentials.email },
          });
        }
        
        return { data, error: null };
      } catch (error) {
        throw handleSupabaseError(error, {
          context: { operation: 'signIn', email: credentials.email },
        });
      }
    },
  },
  
  /**
   * Call edge functions with retry and error handling
   */
  functions: {
    ...supabase.functions,
    
    /**
     * Invoke with retry and error handling
     */
    invoke: async (
      functionName: string,
      options?: {
        body?: object;
        headers?: Record<string, string>;
        method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
        maxRetries?: number;
      }
    ) => {
      const { maxRetries, ...supabaseOptions } = options || {};
      
      try {
        return await withRetry(
          async () => {
            const { data, error } = await supabase.functions.invoke(
              functionName,
              supabaseOptions as FunctionInvokeOptions
            );
            
            if (error) {
              throw error;
            }
            
            return { data, error: null };
          },
          {
            maxRetries: maxRetries || 3,
            context: { functionName, options },
            module: 'edge',
            tenantId: 'system'
          }
        );
      } catch (error) {
        throw handleSupabaseError(error, {
          context: { functionName, options },
          module: 'edge',
        });
      }
    },
  },
  
  // Original client for cases where we need to handle errors differently
  client: supabase,
};

export default supabaseWithErrorHandling;
