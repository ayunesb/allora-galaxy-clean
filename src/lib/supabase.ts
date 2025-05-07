
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create the Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Add polyfills or safe access for commonly used features
const safeSupabase = {
  ...supabase,
  // Safe access to storage methods
  storage: supabase.storage || {
    from: (bucket: string) => ({
      upload: async () => ({
        error: new Error('Storage API not available'),
        data: null
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: '' }
      })
    })
  },
  
  // Safe access to realtime methods
  realtime: supabase.realtime || {
    channel: (name: string) => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {}
    })
  },
  
  // Helper method for realtime channels
  channel: (name: string) => {
    if (supabase.channel) {
      return supabase.channel(name);
    }
    
    // Fallback implementation if channel doesn't exist
    return {
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {}
    };
  },
  
  // Helper method for removing channels
  removeChannel: (channel: any) => {
    if (supabase.removeChannel) {
      return supabase.removeChannel(channel);
    }
    return false;
  }
};

export { safeSupabase as supabase };
