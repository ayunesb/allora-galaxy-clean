
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env/envUtils';

// Create a single supabase client for interacting with your database
const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export type { User, Session } from '@supabase/supabase-js';
