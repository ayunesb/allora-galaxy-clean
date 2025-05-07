
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Ensure all properties are properly bound
supabase.from = supabase.from.bind(supabase);
supabase.rpc = supabase.rpc.bind(supabase);

// Add realtime property to fix typing issues
if (!('realtime' in supabase)) {
  (supabase as any).realtime = {
    channel: (name: string) => supabase.channel(name),
    // Safely add removeChannel if it doesn't exist
    removeChannel: (channel: any) => {
      if (typeof supabase.removeChannel === 'function') {
        return supabase.removeChannel(channel);
      }
      return false;
    }
  };
}

// Export default client for compatibility
export default supabase;
