
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Access environment variables with proper fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ijrnwpgsqsxzqdemtknz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo';

// Create a typed supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export relevant types
export type { User, Session } from '@supabase/supabase-js';
