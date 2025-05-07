
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable access with fallbacks
const getEnvVar = (key: string): string => {
  // Handle both browser and Deno/Edge environments
  const value = import.meta.env?.[key] || 
                process.env?.[key] || 
                // Use typeof check instead of direct Deno reference
                (typeof globalThis !== 'undefined' && 
                 'Deno' in globalThis && 
                 typeof (globalThis as any).Deno?.env?.get === 'function' ? 
                 (globalThis as any).Deno.env.get(key) : '') || 
                '';
                
  if (!value) {
    console.warn(`Environment variable ${key} not found`);
  }
  
  return value;
};

// Get Supabase configuration with fallbacks
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || '';

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

// Create realtime client using the same configuration
export const realtime = supabase;

// Ensure we export a singleton instance
export default supabase;
