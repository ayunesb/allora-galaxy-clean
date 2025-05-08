
import { supabase } from '@/integrations/supabase/client';

/**
 * Deactivates an older version of an agent
 * 
 * @param agentVersionId - ID of the agent version to deactivate
 * @returns Whether the deactivation was successful
 */
export async function deactivateAgent(agentVersionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('agent_versions')
      .update({ status: 'inactive' })
      .eq('id', agentVersionId);
      
    if (error) {
      console.error('Error deactivating agent version:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deactivateAgent:', error);
    return false;
  }
}
