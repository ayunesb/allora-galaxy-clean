
import { supabase } from '@/integrations/supabase/client';

/**
 * Deactivate the old agent version
 */
export async function deactivateOldAgentVersion(agentId: string) {
  try {
    const { error } = await supabase
      .from('agent_versions')
      .update({ status: 'inactive' })
      .eq('id', agentId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating old agent version:', error);
    return false;
  }
}
