
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@/lib/env';

// Create a standard supabase client
export const supabase = createClient(
  getEnv('SUPABASE_URL'),
  getEnv('SUPABASE_ANON_KEY')
);

// Create an admin supabase client (for server-side operations)
export const createServiceClient = () => {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};
