
import { supabase } from '@/integrations/supabase/client';
import { calculateAgentPerformance } from './calculatePerformance';
import { evolvePromptWithFeedback } from './evolvePromptWithFeedback';
import { getFeedbackComments } from './getFeedbackComments';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { getAgentUsageStats } from './getAgentUsageStats';

interface EvolutionOptions {
  tenantId: string;
  agentId?: string | null;
  threshold?: number;
  requireFeedback?: boolean;
  dryRun?: boolean;
}

interface EvolutionResult {
  agentId: string;
  previousVersion: string;
  newVersion: string;
  success: boolean;
  evolved: boolean; // Added as required by the code logic
  error?: string;
  performanceScore?: number;
}

/**
 * Auto-evolve agents based on performance and feedback
 */
export async function autoEvolveAgents(options: EvolutionOptions): Promise<EvolutionResult[]> {
  const {
    tenantId,
    agentId = null,
    threshold = 0.3,
    requireFeedback = true,
    dryRun = false
  } = options;

  try {
    // Log the start of evolution process
    await logSystemEvent(tenantId, 'agent', 'auto_evolve_started', {
      agent_id: agentId,
      threshold,
      require_feedback: requireFeedback,
      dry_run: dryRun
    });

    // Get all agent versions that need to be evaluated
    let query = supabase
      .from('agent_versions')
      .select('*')
      .eq('status', 'active');
      
    if (agentId) {
      query = query.eq('id', agentId);
    }
    
    const { data: agents, error } = await query;
    
    if (error) {
      console.error('Error fetching agents for evolution:', error);
      return [];
    }
    
    if (!agents || agents.length === 0) {
      return [];
    }
    
    const results: EvolutionResult[] = [];
    
    // Process each agent
    for (const agent of agents) {
      try {
        // Get feedback for this agent
        const feedbackData = await getFeedbackComments(agent.id);
        
        // Get usage stats
        const usageStats = await getAgentUsageStats(agent.id);
        
        // Skip agents with no feedback if feedback is required
        if (requireFeedback && (!feedbackData || feedbackData.length === 0)) {
          continue;
        }
        
        // Calculate performance score
        const performanceScore = await calculateAgentPerformance(feedbackData, usageStats);
        
        // If performance is above threshold, no need to evolve
        if (performanceScore >= threshold) {
          continue;
        }
        
        // Log that this agent needs evolution
        await logSystemEvent(tenantId, 'agent', 'agent_evolution_needed', {
          agent_id: agent.id,
          performance_score: performanceScore,
          threshold
        });
        
        if (!dryRun) {
          // Evolve the agent prompt based on feedback
          const newPrompt = await evolvePromptWithFeedback(
            agent.prompt,
            feedbackData
          );
          
          // Create a new version of the agent
          const version = `${parseFloat(agent.version) + 0.1}.0`;
          
          const { data: newAgent, error: createError } = await supabase
            .from('agent_versions')
            .insert({
              plugin_id: agent.plugin_id,
              version,
              prompt: newPrompt,
              status: 'active',
              created_by: agent.created_by
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating evolved agent:', createError);
            results.push({
              agentId: agent.id,
              previousVersion: agent.version,
              newVersion: version,
              success: false,
              evolved: false,
              error: createError.message,
              performanceScore
            });
            continue;
          }
          
          // Deactivate the old agent version
          await supabase
            .from('agent_versions')
            .update({ status: 'inactive' })
            .eq('id', agent.id);
          
          // Log successful evolution
          await logSystemEvent(tenantId, 'agent', 'agent_evolved', {
            agent_id: agent.id,
            new_agent_id: newAgent.id,
            performance_score: performanceScore,
            old_version: agent.version,
            new_version: version
          });
          
          results.push({
            agentId: agent.id,
            previousVersion: agent.version,
            newVersion: version,
            success: true,
            evolved: true,
            performanceScore
          });
        } else {
          // In dry run mode, just log what would happen
          results.push({
            agentId: agent.id,
            previousVersion: agent.version,
            newVersion: `${parseFloat(agent.version) + 0.1}.0`,
            success: true,
            evolved: false, // Not actually evolved in dry run
            performanceScore
          });
        }
      } catch (agentError: any) {
        console.error(`Error processing agent ${agent.id}:`, agentError);
        results.push({
          agentId: agent.id,
          previousVersion: agent.version,
          newVersion: '',
          success: false,
          evolved: false,
          error: agentError.message
        });
      }
    }
    
    // Log completion of evolution process
    await logSystemEvent(tenantId, 'agent', 'auto_evolve_completed', {
      processed_count: agents.length,
      evolved_count: results.filter(r => r.evolved).length,
      error_count: results.filter(r => !r.success).length
    });
    
    return results;
  } catch (error: any) {
    console.error('Error in autoEvolveAgents:', error);
    await logSystemEvent(tenantId, 'agent', 'auto_evolve_error', {
      error: error.message
    });
    return [];
  }
}
