
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '../system/logSystemEvent';

// Function to find the best performing agent version for each plugin
export async function autoEvolveAgents() {
  try {
    // Fetch all active plugins
    const { data: plugins, error: pluginsError } = await supabase
      .from('plugins')
      .select('id, name, category')
      .eq('status', 'active');

    if (pluginsError) {
      throw new Error(`Failed to fetch active plugins: ${pluginsError.message}`);
    }

    if (!plugins || plugins.length === 0) {
      console.log('No active plugins found for auto-evolution');
      return {
        evolved: 0,
        message: 'No active plugins found for auto-evolution'
      };
    }

    let evolvedCount = 0;
    const evolutionResults = [];

    // Process each plugin
    for (const plugin of plugins) {
      try {
        // Get all agent versions for this plugin sorted by XP descending
        const { data: versions, error: versionsError } = await supabase
          .from('agent_versions')
          .select('id, version, xp, status')
          .eq('plugin_id', plugin.id)
          .order('xp', { ascending: false });

        if (versionsError) {
          throw new Error(`Failed to fetch agent versions for plugin ${plugin.id}: ${versionsError.message}`);
        }

        if (!versions || versions.length === 0) {
          console.log(`No agent versions found for plugin ${plugin.name}`);
          continue;
        }

        // Get current active version
        const currentActiveVersion = versions.find(v => v.status === 'active');
        const bestVersion = versions[0]; // The version with the highest XP

        // If the best version isn't the active one and has at least 10% more XP
        if (
          currentActiveVersion &&
          bestVersion.id !== currentActiveVersion.id &&
          bestVersion.xp > currentActiveVersion.xp * 1.1 && // At least 10% better
          bestVersion.xp >= 100 // Minimum threshold for evolution
        ) {
          // Promote this version to active and demote the current active one
          const { error: updateError } = await supabase
            .from('agent_versions')
            .update({ status: 'deprecated' })
            .eq('id', currentActiveVersion.id);

          if (updateError) {
            throw new Error(`Failed to deprecate the current active version: ${updateError.message}`);
          }

          const { error: promoteError } = await supabase
            .from('agent_versions')
            .update({ status: 'active' })
            .eq('id', bestVersion.id);

          if (promoteError) {
            throw new Error(`Failed to promote new best version: ${promoteError.message}`);
          }

          // Log the evolution event
          await logSystemEvent(
            'system',
            'plugin',
            'agent_evolved',
            {
              plugin_id: plugin.id,
              plugin_name: plugin.name,
              old_version_id: currentActiveVersion.id,
              old_version: currentActiveVersion.version,
              new_version_id: bestVersion.id,
              new_version: bestVersion.version,
              xp_improvement: bestVersion.xp - currentActiveVersion.xp,
              xp_improvement_percent: ((bestVersion.xp - currentActiveVersion.xp) / currentActiveVersion.xp * 100).toFixed(2) + '%'
            }
          );

          evolvedCount++;
          evolutionResults.push({
            plugin_name: plugin.name,
            old_version: currentActiveVersion.version,
            new_version: bestVersion.version,
            xp_improvement: bestVersion.xp - currentActiveVersion.xp
          });

          console.log(`Evolved agent for plugin ${plugin.name} from version ${currentActiveVersion.version} to ${bestVersion.version}`);
        } else {
          // No evolution needed for this plugin
          await logSystemEvent(
            'system',
            'plugin',
            'agent_evolution_skipped',
            {
              plugin_id: plugin.id,
              plugin_name: plugin.name,
              reason: !currentActiveVersion
                ? 'No active version to compare against'
                : bestVersion.id === currentActiveVersion.id
                  ? 'Best version is already active'
                  : bestVersion.xp <= currentActiveVersion.xp * 1.1
                    ? 'Not enough XP improvement (needs >10%)'
                    : bestVersion.xp < 100
                      ? 'Best version XP below threshold (100)'
                      : 'Unknown reason'
            }
          );
        }
      } catch (pluginError) {
        console.error(`Error processing plugin ${plugin.name}:`, pluginError);
        
        // Log the error but continue processing other plugins
        await logSystemEvent(
          'system',
          'plugin',
          'agent_evolution_error',
          {
            plugin_id: plugin.id,
            plugin_name: plugin.name,
            error: pluginError.message
          }
        );
      }
    }

    // Log overall results
    await logSystemEvent(
      'system',
      'plugin',
      'agent_evolution_complete',
      {
        total_plugins: plugins.length,
        evolved_count: evolvedCount,
        evolution_results: evolutionResults
      }
    );

    return {
      evolved: evolvedCount,
      total: plugins.length,
      message: `Auto-evolved ${evolvedCount} out of ${plugins.length} plugins`,
      results: evolutionResults
    };

  } catch (error) {
    console.error('Error in autoEvolveAgents:', error);
    
    // Log the overall error
    await logSystemEvent(
      'system',
      'plugin',
      'agent_evolution_failure',
      {
        error: error.message
      }
    );
    
    throw error;
  }
}

// Create a vote-based agent evolution system
export async function evolveAgentByVotes(agentVersionId: string) {
  try {
    // Get the agent version and its plugin
    const { data: agentVersion, error: agentError } = await supabase
      .from('agent_versions')
      .select('id, version, plugin_id, upvotes, downvotes, status')
      .eq('id', agentVersionId)
      .single();

    if (agentError) {
      throw new Error(`Failed to fetch agent version: ${agentError.message}`);
    }

    if (!agentVersion) {
      throw new Error('Agent version not found');
    }

    // Calculate vote ratio (upvotes / total votes)
    const totalVotes = agentVersion.upvotes + agentVersion.downvotes;
    
    if (totalVotes < 5) {
      // Not enough votes to make a decision
      await logSystemEvent(
        'system',
        'plugin',
        'agent_evolution_vote_skipped',
        {
          agent_version_id: agentVersion.id,
          version: agentVersion.version,
          reason: 'Not enough votes',
          upvotes: agentVersion.upvotes,
          downvotes: agentVersion.downvotes,
          total_votes: totalVotes
        }
      );
      
      return {
        evolved: false,
        message: `Not enough votes to evolve agent (${totalVotes} votes, minimum 5 required)`
      };
    }

    const voteRatio = agentVersion.upvotes / totalVotes;

    // If vote ratio is good enough and the version isn't already active
    if (voteRatio >= 0.7 && agentVersion.status !== 'active') {
      // Find the current active version
      const { data: currentActiveVersion, error: activeError } = await supabase
        .from('agent_versions')
        .select('id, version, upvotes, downvotes')
        .eq('plugin_id', agentVersion.plugin_id)
        .eq('status', 'active')
        .maybeSingle();

      if (activeError) {
        throw new Error(`Failed to fetch current active version: ${activeError.message}`);
      }

      // Promote this version to active
      const { error: promoteError } = await supabase
        .from('agent_versions')
        .update({ status: 'active' })
        .eq('id', agentVersion.id);

      if (promoteError) {
        throw new Error(`Failed to promote version: ${promoteError.message}`);
      }

      // If there was a previous active version, deprecate it
      if (currentActiveVersion) {
        const { error: deprecateError } = await supabase
          .from('agent_versions')
          .update({ status: 'deprecated' })
          .eq('id', currentActiveVersion.id);

        if (deprecateError) {
          throw new Error(`Failed to deprecate previous version: ${deprecateError.message}`);
        }
      }

      // Log the evolution event
      await logSystemEvent(
        'system',
        'plugin',
        'agent_evolved_by_votes',
        {
          agent_version_id: agentVersion.id,
          version: agentVersion.version,
          plugin_id: agentVersion.plugin_id,
          vote_ratio: voteRatio.toFixed(2),
          upvotes: agentVersion.upvotes,
          downvotes: agentVersion.downvotes,
          previous_version_id: currentActiveVersion?.id,
          previous_version: currentActiveVersion?.version
        }
      );

      return {
        evolved: true,
        message: `Agent evolved to version ${agentVersion.version} with vote ratio ${(voteRatio * 100).toFixed(2)}%`,
        previousVersion: currentActiveVersion?.version
      };
    } else if (agentVersion.status === 'active') {
      await logSystemEvent(
        'system',
        'plugin',
        'agent_evolution_vote_skipped',
        {
          agent_version_id: agentVersion.id,
          version: agentVersion.version,
          reason: 'Version is already active',
          vote_ratio: voteRatio.toFixed(2)
        }
      );
      
      return {
        evolved: false,
        message: 'Version is already active'
      };
    } else {
      await logSystemEvent(
        'system',
        'plugin',
        'agent_evolution_vote_skipped',
        {
          agent_version_id: agentVersion.id,
          version: agentVersion.version,
          reason: 'Vote ratio too low',
          vote_ratio: voteRatio.toFixed(2),
          upvotes: agentVersion.upvotes,
          downvotes: agentVersion.downvotes
        }
      );
      
      return {
        evolved: false,
        message: `Vote ratio too low: ${(voteRatio * 100).toFixed(2)}% (minimum 70% required)`
      };
    }
  } catch (error) {
    console.error('Error in evolveAgentByVotes:', error);
    
    // Log the error
    await logSystemEvent(
      'system',
      'plugin',
      'agent_evolution_vote_failure',
      {
        agent_version_id: agentVersionId,
        error: error.message
      }
    );
    
    throw error;
  }
}
