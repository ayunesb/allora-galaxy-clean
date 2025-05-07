
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface SimulateXpOptions {
  agent_version_id: string;
  tenant_id: string;
  xp_amount?: number;
  upvotes?: number;
  downvotes?: number;
  simulate_logs?: boolean;
  log_count?: number;
}

/**
 * Hook to help simulate agent XP accumulation for testing purposes
 */
export function useAgentXpSimulator() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResults, setLastResults] = useState<any>(null);
  const { toast } = useToast();
  
  /**
   * Simulate agent upvotes/downvotes
   */
  const simulateVotes = async ({
    agent_version_id,
    tenant_id,
    upvotes = 0,
    downvotes = 0
  }: SimulateXpOptions) => {
    setIsLoading(true);
    try {
      const votes = [];
      
      // Generate upvotes
      for (let i = 0; i < upvotes; i++) {
        votes.push({
          id: uuidv4(),
          agent_version_id,
          tenant_id,
          user_id: `test-user-${i}`,
          vote_type: 'upvote',
          created_at: new Date().toISOString()
        });
      }
      
      // Generate downvotes
      for (let i = 0; i < downvotes; i++) {
        votes.push({
          id: uuidv4(),
          agent_version_id,
          tenant_id,
          user_id: `test-user-${i + upvotes}`,
          vote_type: 'downvote',
          created_at: new Date().toISOString()
        });
      }
      
      // Insert votes if there are any
      if (votes.length > 0) {
        const { data, error } = await supabase
          .from('agent_votes')
          .insert(votes)
          .select();
          
        if (error) {
          throw new Error(`Error inserting votes: ${error.message}`);
        }
        
        toast({
          title: "Votes simulated",
          description: `Added ${upvotes} upvotes and ${downvotes} downvotes to agent ${agent_version_id}`,
          variant: "default"
        });
        
        return data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error simulating votes:', error);
      
      toast({
        title: "Error simulating votes",
        description: error.message,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Simulate agent plugin logs
   */
  const simulateLogs = async ({
    agent_version_id,
    tenant_id,
    xp_amount = 100,
    log_count = 5
  }: SimulateXpOptions) => {
    setIsLoading(true);
    try {
      // First get the plugin_id for this agent version
      const { data: agent, error: agentError } = await supabase
        .from('agent_versions')
        .select('plugin_id')
        .eq('id', agent_version_id)
        .single();
        
      if (agentError || !agent) {
        throw new Error(`Error fetching agent: ${agentError?.message || 'Agent not found'}`);
      }
      
      const plugin_id = agent.plugin_id;
      const logs = [];
      
      // Calculate XP per log
      const xpPerLog = Math.floor(xp_amount / log_count);
      
      // Generate logs
      for (let i = 0; i < log_count; i++) {
        logs.push({
          id: uuidv4(),
          plugin_id,
          agent_version_id,
          tenant_id,
          execution_id: uuidv4(),
          status: 'success',
          xp_earned: xpPerLog,
          context: {
            test: true,
            execution_number: i + 1,
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
      }
      
      // Insert logs
      const { data, error } = await supabase
        .from('plugin_logs')
        .insert(logs)
        .select();
        
      if (error) {
        throw new Error(`Error inserting logs: ${error.message}`);
      }
      
      toast({
        title: "Logs simulated",
        description: `Added ${log_count} logs with total XP ${xp_amount} to agent ${agent_version_id}`,
        variant: "default"
      });
      
      return data;
    } catch (error: any) {
      console.error('Error simulating logs:', error);
      
      toast({
        title: "Error simulating logs",
        description: error.message,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Simulate XP accumulation through both votes and logs
   */
  const simulateXpAccumulation = async (options: SimulateXpOptions) => {
    setIsLoading(true);
    try {
      const {
        agent_version_id,
        tenant_id,
        xp_amount = 100,
        upvotes = 1,
        downvotes = 0,
        simulate_logs = true,
        log_count = 5
      } = options;
      
      // Simulate votes
      const votesResult = await simulateVotes({
        agent_version_id,
        tenant_id,
        upvotes,
        downvotes
      });
      
      // Simulate logs if requested
      let logsResult = null;
      if (simulate_logs) {
        logsResult = await simulateLogs({
          agent_version_id,
          tenant_id,
          xp_amount,
          log_count
        });
      }
      
      // Update agent version with XP (this would normally be done by a trigger in production)
      const { data: agent, error: agentError } = await supabase
        .from('agent_versions')
        .select('xp, upvotes, downvotes')
        .eq('id', agent_version_id)
        .single();
        
      if (agentError) {
        throw new Error(`Error fetching agent: ${agentError.message}`);
      }
      
      const currentXp = agent?.xp || 0;
      const currentUpvotes = agent?.upvotes || 0;
      const currentDownvotes = agent?.downvotes || 0;
      
      const newXp = currentXp + xp_amount;
      const newUpvotes = currentUpvotes + upvotes;
      const newDownvotes = currentDownvotes + downvotes;
      
      const { error: updateError } = await supabase
        .from('agent_versions')
        .update({
          xp: newXp,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent_version_id);
        
      if (updateError) {
        throw new Error(`Error updating agent XP: ${updateError.message}`);
      }
      
      // Check if agent is eligible for promotion
      const { data: checkData, error: checkError } = await supabase.functions.invoke(
        'autoEvolveAgents',
        {
          body: {
            tenant_id,
            requires_approval: true
          }
        }
      );
      
      if (checkError) {
        console.warn('Error checking agent for promotion:', checkError);
      }
      
      const results = {
        votesResult,
        logsResult,
        xpUpdated: {
          agent_version_id,
          previous: { xp: currentXp, upvotes: currentUpvotes, downvotes: currentDownvotes },
          current: { xp: newXp, upvotes: newUpvotes, downvotes: newDownvotes },
          delta: { xp: xp_amount, upvotes, downvotes }
        },
        promotionCheck: checkData || { error: checkError }
      };
      
      setLastResults(results);
      
      toast({
        title: "XP Accumulation Simulated",
        description: `Agent updated with ${xp_amount} XP and ${upvotes} upvotes`,
        variant: "default"
      });
      
      return results;
    } catch (error: any) {
      console.error('Error simulating XP accumulation:', error);
      
      toast({
        title: "Error simulating XP accumulation",
        description: error.message,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Reset agent XP and votes for testing
   */
  const resetAgentXp = async (agent_version_id: string) => {
    setIsLoading(true);
    try {
      // Reset XP, upvotes, and downvotes
      const { error: updateError } = await supabase
        .from('agent_versions')
        .update({
          xp: 0,
          upvotes: 0,
          downvotes: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent_version_id);
        
      if (updateError) {
        throw new Error(`Error resetting agent XP: ${updateError.message}`);
      }
      
      toast({
        title: "Agent XP Reset",
        description: `Agent ${agent_version_id} XP and votes have been reset to 0`,
        variant: "default"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error resetting agent XP:', error);
      
      toast({
        title: "Error resetting agent XP",
        description: error.message,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    simulateVotes,
    simulateLogs,
    simulateXpAccumulation,
    resetAgentXp,
    isLoading,
    lastResults
  };
}
