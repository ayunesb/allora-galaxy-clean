
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { AiDecision } from '@/components/admin/ai-decisions/types';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Interface for AI decision filters
 */
export interface AiDecisionFilters {
  tenant_id?: string;
  decision_type?: string;
  reviewed?: boolean;
  review_outcome?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch users associated with a tenant
 * @param tenantId The tenant ID
 * @returns Promise with users data
 */
export async function fetchTenantUsers(tenantId: string) {
  try {
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select(`
        id,
        role,
        user_id,
        created_at,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url,
          email:id(email)
        )
      `)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error fetching tenant users:', error);
      throw error;
    }

    return data || [];
  } catch (err: any) {
    console.error('Error in fetchTenantUsers:', err);
    // Log the error
    await logSystemEvent(
      'admin',
      'error',
      { message: 'Failed to fetch tenant users', error: err.message },
      tenantId
    );
    return [];
  }
}

/**
 * Fetch AI decisions (agent executions and votes)
 * @param filters Filter options
 * @returns Promise with AI decisions data
 */
export async function fetchAiDecisions(filters: AiDecisionFilters = {}): Promise<AiDecision[]> {
  try {
    // First get executions
    let query = supabase
      .from('executions')
      .select(`
        *,
        agent_versions:agent_version_id (
          id,
          version,
          prompt,
          plugin_id,
          plugins:plugin_id (name)
        )
      `)
      .eq('type', 'agent')
      .order('created_at', { ascending: false });
      
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data: executions, error: executionsError } = await query;

    if (executionsError) {
      console.error('Error fetching AI decisions:', executionsError);
      throw executionsError;
    }

    // Transform to AiDecision type
    const decisions: AiDecision[] = (executions || []).map(execution => {
      const pluginName = execution.agent_versions?.plugins?.name || 'Unknown Plugin';
      const agentVersion = execution.agent_versions?.version || 'Unknown Version';
      
      return {
        id: execution.id,
        module: 'agent',
        event: 'execution',
        created_at: execution.created_at,
        tenant_id: execution.tenant_id,
        context: {
          execution_id: execution.id,
          plugin_id: execution.plugin_id,
          agent_version_id: execution.agent_version_id,
          input: execution.input,
          output: execution.output,
          execution_time: execution.execution_time,
          status: execution.status,
          error: execution.error
        },
        decision_type: `${pluginName} v${agentVersion}`,
        reviewed: false, // Default value, would need to be updated from a reviews table
        review_outcome: null,
        review_comment: null,
        reviewer_id: null,
        review_date: null
      };
    });

    return decisions;
  } catch (err: any) {
    console.error('Error in fetchAiDecisions:', err);
    // Log the error
    await logSystemEvent(
      'admin',
      'error',
      { message: 'Failed to fetch AI decisions', error: err.message },
      filters.tenant_id
    );
    return [];
  }
}

/**
 * Custom hook to fetch tenant users with React Query
 * @param tenantId The tenant ID
 * @returns Query result object
 */
export function useTenantUsers(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['tenant_users', tenantId],
    queryFn: () => tenantId ? fetchTenantUsers(tenantId) : Promise.resolve([]),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch AI decisions with React Query
 * @param filters Filter options
 * @returns Query result object
 */
export function useAiDecisions(filters: AiDecisionFilters = {}) {
  return useQuery({
    queryKey: ['ai_decisions', filters],
    queryFn: () => fetchAiDecisions(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}
