import { supabase } from '@/lib/supabase';
import { AiDecision } from '@/components/admin/ai-decisions/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Filter type for AI decisions
 */
export interface AiDecisionFilters {
  tenant_id?: string;
  decision_type?: string;
  reviewed?: boolean;
  review_outcome?: string;
  date_from?: Date | null;
  date_to?: Date | null;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch AI decisions based on filters
 * @param filters Object containing filter parameters
 * @returns Promise with array of AiDecision objects
 */
export async function fetchAiDecisions(filters: AiDecisionFilters = {}): Promise<AiDecision[]> {
  try {
    let query = supabase
      .from('ai_decisions')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    
    if (filters.decision_type) {
      query = query.eq('decision_type', filters.decision_type);
    }
    
    if (filters.reviewed !== undefined) {
      query = query.eq('reviewed', filters.reviewed);
    }
    
    if (filters.review_outcome) {
      query = query.eq('review_outcome', filters.review_outcome);
    }
    
    if (filters.search) {
      query = query.or(`context.ilike.%${filters.search}%,module.ilike.%${filters.search}%`);
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from.toISOString());
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to.toISOString());
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform raw data to proper AiDecision objects
    return (data || []).map((item: any): AiDecision => ({
      id: item.id,
      module: item.module || 'ai',
      event: item.event || 'decision',
      created_at: item.created_at,
      tenant_id: item.tenant_id,
      context: {
        execution_id: item.context?.execution_id,
        plugin_id: item.context?.plugin_id,
        agent_version_id: item.context?.agent_version_id,
        input: item.context?.input,
        output: item.context?.output,
        execution_time: item.context?.execution_time,
        status: item.context?.status,
        error: item.context?.error
      },
      decision_type: item.decision_type,
      confidence: item.confidence,
      confidence_score: item.confidence_score,
      reviewed: item.reviewed || false,
      review_outcome: item.review_outcome,
      reviewer_id: item.reviewer_id,
      reviewed_by: item.reviewed_by,
      reviewed_at: item.reviewed_at,
      review_date: item.review_date,
      input: item.input,
      output: item.output,
      model: item.model,
      prompt: item.prompt,
      completion: item.completion,
      tokens_used: item.tokens_used,
      strategy_id: item.strategy_id,
      plugin_id: item.plugin_id,
      alternatives: item.alternatives,
      metadata: item.metadata
    }));
    
  } catch (error) {
    console.error('Error fetching AI decisions:', error);
    return [];
  }
}

/**
 * Update an AI decision review
 * @param id ID of the decision to update
 * @param reviewData Review data to update
 * @returns Promise with success status
 */
export async function updateAiDecisionReview(
  id: string,
  reviewData: {
    reviewed: boolean;
    review_outcome?: 'approved' | 'rejected' | 'modified';
    reviewer_id: string;
    review_comment?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_decisions')
      .update({
        reviewed: reviewData.reviewed,
        review_outcome: reviewData.review_outcome,
        reviewer_id: reviewData.reviewer_id,
        review_comment: reviewData.review_comment,
        review_date: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error updating AI decision review:', error);
    return false;
  }
}

/**
 * Custom hook to fetch AI decisions with React Query
 * @param filters Filter parameters
 * @returns Query result object
 */
export function useAiDecisions(filters: AiDecisionFilters = {}) {
  return useQuery({
    queryKey: ['ai-decisions', filters],
    queryFn: () => fetchAiDecisions(filters),
    staleTime: 60 * 1000 // 60 seconds
  });
}
