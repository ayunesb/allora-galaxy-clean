
import { supabase } from '@/integrations/supabase/client';

/**
 * Get an agent version by ID
 */
export async function getAgentVersion(agentVersionId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', agentVersionId)
      .single();

    if (error) {
      console.error('Error fetching agent version:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching agent version:', error);
    return null;
  }
}

/**
 * Get all versions of an agent for a specific plugin
 */
export async function getAgentVersions(pluginId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('plugin_id', pluginId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agent versions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching agent versions:', error);
    return [];
  }
}

/**
 * Get the active agent version for a plugin
 */
export async function getActiveAgentVersion(pluginId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('plugin_id', pluginId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching active agent version:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching active agent version:', error);
    return null;
  }
}

/**
 * Create a new agent version
 */
export async function createAgentVersion(pluginId: string, prompt: string, tenantId: string, createdBy?: string) {
  try {
    // Get the current versions for this plugin to determine next version number
    const { data: versions } = await supabase
      .from('agent_versions')
      .select('version')
      .eq('plugin_id', pluginId);
    
    // Determine the next version number
    let nextVersion = '1.0.0';
    if (versions && versions.length > 0) {
      // Find the highest version number
      const sortedVersions = versions
        .map(v => v.version)
        .sort((a, b) => {
          const aParts = a.split('.').map(Number);
          const bParts = b.split('.').map(Number);
          
          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aPart = i < aParts.length ? aParts[i] : 0;
            const bPart = i < bParts.length ? bParts[i] : 0;
            
            if (aPart !== bPart) {
              return bPart - aPart;
            }
          }
          
          return 0;
        });
      
      // Increment the highest version
      const highestVersion = sortedVersions[0];
      const parts = highestVersion.split('.').map(Number);
      parts[2] += 1; // Increment patch version
      nextVersion = parts.join('.');
    }

    // Mark existing active versions as deprecated
    await supabase
      .from('agent_versions')
      .update({ status: 'deprecated' })
      .eq('plugin_id', pluginId)
      .eq('status', 'active');

    // Create the new agent version
    const { data, error } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: pluginId,
        version: nextVersion,
        prompt: prompt,
        status: 'active',
        tenant_id: tenantId,
        created_by: createdBy,
        xp: 0,
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agent version:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error creating agent version:', error);
    throw error;
  }
}
