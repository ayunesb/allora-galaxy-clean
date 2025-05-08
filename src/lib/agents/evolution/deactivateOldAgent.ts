
import { supabase } from '@/integrations/supabase/client';

/**
 * Deactivates an old agent version after evolution
 * @param oldVersionId Agent version ID to deactivate
 * @param newVersionId New agent version ID that replaces it
 * @returns Success result
 */
export async function deactivateAgentVersion(
  oldVersionId: string,
  newVersionId: string
): Promise<boolean> {
  try {
    // Update the old version's status to inactive
    const { error } = await supabase
      .from('agent_versions')
      .update({
        status: 'inactive',
        replaced_by: newVersionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', oldVersionId);
    
    if (error) {
      console.error(`Failed to deactivate agent version ${oldVersionId}:`, error);
      return false;
    }
    
    return true;
  } catch (err: any) {
    console.error(`Error deactivating agent version ${oldVersionId}:`, err);
    return false;
  }
}

// For backward compatibility
export const deactivateOldAgent = deactivateAgentVersion;

// Export a common alias for consistency
export { deactivateAgentVersion as deactivateAgent };
