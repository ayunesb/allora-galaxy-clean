
// Re-export supabase client from integrations
export { supabase, supabaseClient } from '@/integrations/supabase/client';

// Export other useful Supabase utilities
export {
  from,
  storage,
  channel, 
  checkNetworkStatus,
  startReconnectionCheck,
  stopReconnectionCheck
} from '@/integrations/supabase/client';
