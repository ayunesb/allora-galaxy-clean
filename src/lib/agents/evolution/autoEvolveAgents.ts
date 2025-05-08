
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface AutoEvolveConfig {
  minimumExecutions?: number;
  failureRateThreshold?: number;
  staleDays?: number;
  batchSize?: number;
}

interface AutoEvolveResult {
  success: boolean;
  evolvedAgents: number;
  message?: string;
  errors?: any[];
}

/**
 * Automatically evolves agent versions that need improvement based on metrics
 * @param tenantId The tenant ID to evolve agents for
 * @param config Configuration for auto evolution
 */
export async function autoEvolveAgents(
  tenantId: string, 
  config: AutoEvolveConfig = {}
): Promise<AutoEvolveResult> {
  const {
    minimumExecutions = 10,
    failureRateThreshold = 0.3,
    staleDays = 30,
    batchSize = 5
  } = config;

  try {
    // Log the start of auto evolution
    await logSystemEvent(
      'agent',
      'info',
      { 
        event: 'auto_evolve_started',
        tenant_id: tenantId,
        config
      },
      tenantId
    );

    // Get agent versions that need evolution based on metrics
    const { data: agentVersions, error } = await supabase
      .from('agent_versions')
      .select(`
        id, 
        plugin_id, 
        version, 
        prompt,
        status,
        xp,
        created_at,
        upvotes,
        downvotes
      `)
      .eq('tenant_id', tenantId)
      .limit(batchSize);

    if (error) {
      await logSystemEvent(
        'agent',
        'error',
        { 
          event: 'auto_evolve_failed',
          tenant_id: tenantId,
          error: error.message 
        },
        tenantId
      );
      
      return { 
        success: false,
        evolvedAgents: 0,
        errors: [error]
      };
    }

    if (!agentVersions || agentVersions.length === 0) {
      return {
        success: true,
        evolvedAgents: 0,
        message: 'No agents needed evolution'
      };
    }

    // Track successfully evolved agents
    const evolvedAgents: string[] = [];
    const evolutionErrors: any[] = [];

    // Process each agent version that needs evolution
    for (const agent of agentVersions) {
      try {
        // Calculate agent metrics to determine if evolution is needed
        const voteRatio = agent.upvotes + agent.downvotes === 0 
          ? 0.5 
          : agent.upvotes / (agent.upvotes + agent.downvotes);
        
        const needsEvolution = voteRatio < 0.5 || 
          (Date.now() - new Date(agent.created_at).getTime() > staleDays * 86400000);
        
        if (!needsEvolution) {
          continue;
        }

        // Generate new prompt for the agent
        const newPrompt = await generateImprovedPrompt(agent.prompt, agent.downvotes);
        
        // Insert new agent version
        const { data: newAgent, error: insertError } = await supabase
          .from('agent_versions')
          .insert({
            plugin_id: agent.plugin_id,
            version: incrementVersion(agent.version),
            prompt: newPrompt,
            status: 'active',
            tenant_id: tenantId
          })
          .select()
          .single();

        if (insertError || !newAgent) {
          throw new Error(`Failed to insert new agent version: ${insertError?.message}`);
        }

        // Update old agent version status to deprecated
        await supabase
          .from('agent_versions')
          .update({ status: 'deprecated' })
          .eq('id', agent.id);

        evolvedAgents.push(newAgent.id);

        // Log successful evolution
        await logSystemEvent(
          'agent',
          'success',
          {
            event: 'agent_evolved',
            tenant_id: tenantId,
            previous_agent_id: agent.id,
            new_agent_id: newAgent.id
          },
          tenantId
        );
      } catch (agentError: any) {
        evolutionErrors.push({
          agent_id: agent.id,
          error: agentError.message
        });
        
        await logSystemEvent(
          'agent',
          'error',
          {
            event: 'agent_evolution_failed',
            tenant_id: tenantId,
            agent_id: agent.id,
            error: agentError.message
          },
          tenantId
        );
      }
    }

    // Log completion of auto evolution
    await logSystemEvent(
      'agent',
      'info',
      {
        event: 'auto_evolve_completed',
        tenant_id: tenantId,
        evolved_count: evolvedAgents.length,
        error_count: evolutionErrors.length
      },
      tenantId
    );

    return {
      success: true,
      evolvedAgents: evolvedAgents.length,
      errors: evolutionErrors.length > 0 ? evolutionErrors : undefined
    };
  } catch (error: any) {
    // Log any unhandled errors
    await logSystemEvent(
      'agent',
      'error',
      {
        event: 'auto_evolve_failed',
        tenant_id: tenantId,
        error: error.message
      },
      tenantId
    );

    return {
      success: false,
      evolvedAgents: 0,
      errors: [error]
    };
  }
}

/**
 * Increments the version string (e.g., "1.0.0" -> "1.0.1")
 */
function incrementVersion(version: string): string {
  const parts = version.split('.');
  const lastIndex = parts.length - 1;
  
  if (lastIndex >= 0) {
    parts[lastIndex] = (parseInt(parts[lastIndex]) + 1).toString();
  } else {
    return '1.0.0';
  }
  
  return parts.join('.');
}

/**
 * Simulated function to generate an improved prompt based on feedback
 * In a real application, this would use more sophisticated NLP techniques
 */
async function generateImprovedPrompt(currentPrompt: string, downvotes: number): Promise<string> {
  // This is a placeholder - in a real app, this would use AI services
  // to analyze and improve the prompt based on feedback
  return currentPrompt + `\n\nVersion improved based on ${downvotes} instances of user feedback.`;
}
