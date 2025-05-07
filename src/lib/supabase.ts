
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { getEnv } from '@/lib/utils/env';

// Get Supabase URL and key from environment variables with fallback to the predefined values in integrations file
const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://ijrnwpgsqsxzqdemtknz.supabase.co') || 'https://ijrnwpgsqsxzqdemtknz.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo';

// Ensure we have the required values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file or environment configuration.');
}

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Ensure all properties are properly bound
supabase.from = supabase.from.bind(supabase);
supabase.rpc = supabase.rpc.bind(supabase);

// Create a properly typed realtime property
export const realtime = {
  channel: (name: string) => supabase.channel(name),
  removeChannel: (channel: any) => {
    if (typeof supabase.removeChannel === 'function') {
      return supabase.removeChannel(channel);
    }
    return false;
  }
};

// Add realtime property to the supabase client
(supabase as any).realtime = realtime;

// Export default client for compatibility
export default supabase;
