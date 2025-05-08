
import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from '@/lib/env/envUtils'; // Ensure this path is correct or create the module
import type { SupabaseClient } from '@supabase/supabase-js';

// Get Supabase configuration with proper error handling
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(`
    Missing required Supabase configuration: 
    - VITE_SUPABASE_URL: ${supabaseUrl ? 'Found' : 'Missing'}
    - VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Found' : 'Missing'}
    
    Please check your environment variables.
  `);
}

// Create Supabase client with fallback empty values to prevent crashes
// The application will show appropriate errors if these values are missing
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

// Export realtime channel functionality
// This is needed for the NotificationsContainer component
export const realtime = supabase.channel.bind(supabase);

// Ensure we export a singleton instance
export default supabase;
