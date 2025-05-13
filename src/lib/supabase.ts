
import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Create a single supabase client for interacting with your database
const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export { User, Session } from '@supabase/supabase-js';
