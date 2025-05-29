import { createClient } from "@supabase/supabase-js";
import { getEnvWithDefault } from "@/lib/env";

// Get Supabase URL and key with hardcoded fallbacks to prevent blank screens
const supabaseUrl = getEnvWithDefault(
  "VITE_SUPABASE_URL",
  "https://ijrnwpgsqsxzqdemtknz.supabase.co",
);
const supabaseAnonKey = getEnvWithDefault(
  "VITE_SUPABASE_ANON_KEY",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo",
);

// Create Supabase client with consistent configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "allora_auth_token",
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      "x-application-name": "allora-os",
    },
  },
});

/**
 * Enhanced Supabase client with better error handling for common operations
 */
export const supabaseWithErrorHandler = {
  from: (table: string) => {
    const client = supabase.from(table);

    return {
      ...client,
      select: async (...args: Parameters<typeof client.select>) => {
        try {
          return await client.select(...args).throwOnError();
        } catch (error: any) {
          console.error(
            `Database Error (${table}.select):`,
            error.message || "Failed to fetch data",
          );
          throw error;
        }
      },
      insert: async (...args: Parameters<typeof client.insert>) => {
        try {
          return await client.insert(...args).throwOnError();
        } catch (error: any) {
          console.error(
            `Database Insert Error (${table}.insert):`,
            error.message || "Failed to insert data",
          );
          throw error;
        }
      },
      update: async (...args: Parameters<typeof client.update>) => {
        try {
          return await client.update(...args).throwOnError();
        } catch (error: any) {
          console.error(
            `Database Update Error (${table}.update):`,
            error.message || "Failed to update data",
          );
          throw error;
        }
      },
      delete: async (...args: Parameters<typeof client.delete>) => {
        try {
          return await client.delete(...args).throwOnError();
        } catch (error: any) {
          console.error(
            `Database Delete Error (${table}.delete):`,
            error.message || "Failed to delete data",
          );
          throw error;
        }
      },
      upsert: async (...args: Parameters<typeof client.upsert>) => {
        try {
          return await client.upsert(...args).throwOnError();
        } catch (error: any) {
          console.error(
            `Database Upsert Error (${table}.upsert):`,
            error.message || "Failed to upsert data",
          );
          throw error;
        }
      },
    };
  },
  rpc: async (fn: string, params?: Record<string, any>) => {
    try {
      return await supabase.rpc(fn, params).throwOnError();
    } catch (error: any) {
      console.error(
        `RPC Error (${fn}):`,
        error.message || "Failed to execute RPC",
      );
      throw error;
    }
  },
  auth: supabase.auth,
  storage: supabase.storage,
  functions: supabase.functions,
};

// Re-export the Supabase client types
export type { Session, User } from "@supabase/supabase-js";

// Export a function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};
