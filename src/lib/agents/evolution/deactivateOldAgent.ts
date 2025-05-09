
import { supabase } from '@/integrations/supabase/client';

/**
 * Deactivates an old agent version after evolution
 * @param agentId ID of the agent version to deactivate
 * @returns Success status
 */
export async function deactivateOldAgent(agentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('agent_versions')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);
    
    if (error) {
      console.error('Error deactivating old agent:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deactivating old agent:', error);
    return false;
  }
}
