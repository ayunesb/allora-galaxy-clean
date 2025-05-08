
import { supabase } from '@/integrations/supabase/client';
import { getFeedbackComments } from './getFeedbackComments';
import { calculateAgentPerformance } from './calculatePerformance';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateAgent } from './deactivateOldAgent';
import { getAgentUsageStats } from './getAgentUsageStats';

export interface AgentPerformanceMetrics {
  needsEvolution: boolean;
  evolutionReason?: string;
  positiveVotes?: number;
  negativeVotes?: number;
  neutralVotes?: number;
  totalExecutions?: number;
  successRate?: number;
  averageExecutionTime?: number;
  xpEarned?: number;
}

/**
 * Main function to auto-evolve agents based on feedback and performance
 * @param options Configuration options for auto evolution
 * @returns Promise with result of evolution process
 */
export async function autoEvolveAgents({
  tenantId,
  agentId = null,
  threshold = 0.7,
  requireFeedback = true,
  dryRun = false,
}: {
  tenantId: string;
  agentId?: string | null;
  threshold?: number;
  requireFeedback?: boolean;
  dryRun?: boolean;
}): Promise<{
  evolved: number;
  candidates: number;
  errors: string[];
}> {
  const result = {
    evolved: 0,
    candidates: 0,
    errors: [] as string[]
  };
  
  console.log(`Starting auto evolution for ${tenantId}, agentId: ${agentId}, threshold: ${threshold}`);
  
  try {
    // Query for active agent versions that need evolution
    const query = supabase
      .from('agent_versions')
      .select(`
        id,
        agent_id,
        version,
        prompt,
        created_at,
        metadata,
        agents!inner(
          id,
          name,
          description,
          tenant_id
        )
      `)
      .eq('agents.tenant_id', tenantId)
      .eq('is_active', true)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
      
    // Apply agent filter if provided
    const { data: agentVersions, error } = agentId 
      ? await query.eq('agent_id', agentId)
      : await query;
      
    if (error) {
      console.error('Error fetching agent versions:', error);
      result.errors.push(`Failed to fetch agent versions: ${error.message}`);
      return result;
    }
    
    const candidates = [];
    
    // Process each active agent version
    for (const version of agentVersions || []) {
      try {
        console.log(`Processing agent ${version.agent_id}, version ${version.id}`);
        
        // Get feedback for this agent version
        const { data: feedbackData } = await supabase
          .from('agent_feedback')
          .select('*')
          .eq('agent_version_id', version.id);
          
        // Get usage statistics for performance calculation
        const usageStats = await getAgentUsageStats(version.id);
        
        // Calculate performance score based on feedback and usage
        const performanceScore = calculateAgentPerformance(feedbackData || [], usageStats);
        console.log(`Performance score: ${performanceScore}`);
        
        // Skip if performance is above threshold
        if (performanceScore >= threshold) {
          console.log(`Performance above threshold (${threshold}), skipping evolution`);
          continue;
        }
        
        result.candidates++;
        candidates.push({
          id: version.id,
          agentId: version.agent_id,
          score: performanceScore,
          version: version.version
        });
        
        if (!dryRun) {
          // Get feedback comments for evolution
          const comments = await getFeedbackComments(version.id);
          
          if (requireFeedback && (!comments || comments.length === 0)) {
            console.log(`No feedback comments available, skipping evolution`);
            continue;
          }
          
          // Create evolved agent version with reason
          const evolutionReason = `Auto-evolution triggered: performance score ${performanceScore} below threshold ${threshold}`;
          
          // Create evolved agent version
          const result = await createEvolvedAgent(
            version.id, 
            tenantId,
            evolutionReason
          );
          
          if (result.success) {
            // Deactivate old version
            await deactivateAgent(version.id);
            result.evolved++;
          }
        }
      } catch (err: any) {
        console.error(`Error processing agent version ${version.id}:`, err);
        result.errors.push(`Error evolving agent ${version.agent_id}: ${err.message}`);
      }
    }
    
    console.log(`Auto evolution complete. Candidates: ${result.candidates}, Evolved: ${result.evolved}`);
    return result;
  } catch (err: any) {
    console.error('Error in autoEvolveAgents:', err);
    result.errors.push(`General error: ${err.message}`);
    return result;
  }
}
