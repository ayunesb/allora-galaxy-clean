
import { supabase } from '@/lib/supabase';

/**
 * Deactivate an agent version by marking it as deprecated
 * @param agentId The agent version ID to deactivate
 */
export async function deactivateAgent(agentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('agent_versions')
      .update({ 
        status: 'deprecated',
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);
      
    if (error) {
      console.error('Error deactivating agent:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error deactivating agent:', err);
    return false;
  }
}
