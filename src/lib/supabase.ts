
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create the Supabase client
const originalClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export enhanced Supabase client with consistent API methods
export const supabase = {
  ...originalClient,
  
  // Explicitly bind methods
  from: originalClient.from.bind(originalClient),
  auth: originalClient.auth,
  storage: originalClient.storage,
  rpc: originalClient.rpc.bind(originalClient),
  functions: originalClient.functions,
  realtime: originalClient.realtime,
  channel: originalClient.channel.bind(originalClient),
  removeChannel: originalClient.removeChannel ? 
    originalClient.removeChannel.bind(originalClient) : 
    (channel: any) => false
};
