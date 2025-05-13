
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/env';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  ENV.SUPABASE_URL || '',
  ENV.SUPABASE_ANON_KEY || ''
);
