
import { createClient } from '@supabase/supabase-js';
import { getEnvWithDefault } from '@/lib/env';

/**
 * Create a Supabase admin client with service role
 * @returns Supabase client instance or null if environment variables are missing
 */
export function createSupabaseAdmin() {
  try {
    const supabaseUrl = getEnvWithDefault('VITE_SUPABASE_URL', '');
    const supabaseServiceKey = getEnvWithDefault('VITE_SUPABASE_SERVICE_ROLE_KEY', '');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase admin credentials');
      return null;
    }
    
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });
  } catch (error) {
    console.error('Error creating Supabase admin client:', error);
    return null;
  }
}
