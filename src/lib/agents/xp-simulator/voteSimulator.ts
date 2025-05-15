
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notifications/toast';
import { generateUuid } from './types';
import type { SimulateXpOptions, VoteSimulationResult } from './types';

/**
 * Simulates upvotes and downvotes for an agent version
 */
export async function simulateVotes({
  agent_version_id,
  tenant_id,
  upvotes = 0,
  downvotes = 0
}: SimulateXpOptions): Promise<VoteSimulationResult | null> {
  try {
    const votes = [];
    
    // Generate upvotes
    for (let i = 0; i < upvotes; i++) {
      votes.push({
        id: generateUuid(),
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
        id: generateUuid(),
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
      
      notify({
        title: "Votes simulated",
        description: `Added ${upvotes} upvotes and ${downvotes} downvotes to agent ${agent_version_id}`
      });
      
      return {
        agent_version_id,
        votes: data || []
      };
    }
    
    return {
      agent_version_id,
      votes: []
    };
  } catch (error: any) {
    console.error('Error simulating votes:', error);
    
    notify({
      title: "Error simulating votes",
      description: error.message
    }, { type: 'error' });
    
    return null;
  }
}
