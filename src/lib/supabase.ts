
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
