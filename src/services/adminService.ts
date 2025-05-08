
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch users associated with a tenant
 * @param tenantId The tenant ID
 * @returns Promise with users data
 */
export const fetchTenantUsers = async (tenantId: string) => {
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
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in fetchTenantUsers:', err);
    return [];
  }
};

/**
 * Fetch system logs
 * @param tenantId The tenant ID
 * @param limit Number of logs to fetch
 * @param offset Offset for pagination
 * @returns Promise with system logs data
 */
export const fetchSystemLogs = async (tenantId: string, limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching system logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in fetchSystemLogs:', err);
    return [];
  }
};

/**
 * Fetch plugin logs
 * @param tenantId The tenant ID
 * @param limit Number of logs to fetch
 * @param offset Offset for pagination
 * @returns Promise with plugin logs data
 */
export const fetchPluginLogs = async (tenantId: string, limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('plugin_logs')
      .select(`
        *,
        plugins:plugin_id (name),
        strategies:strategy_id (title)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching plugin logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in fetchPluginLogs:', err);
    return [];
  }
};

/**
 * Fetch AI decisions (agent executions and votes)
 * @param tenantId The tenant ID
 * @param limit Number of records to fetch
 * @param offset Offset for pagination
 * @returns Promise with AI decisions data
 */
export const fetchAiDecisions = async (tenantId: string, limit = 50, offset = 0) => {
  try {
    // First get executions
    const { data: executions, error: executionsError } = await supabase
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
      .eq('tenant_id', tenantId)
      .eq('type', 'agent')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (executionsError) {
      console.error('Error fetching AI decisions:', executionsError);
      return [];
    }

    return executions || [];
  } catch (err) {
    console.error('Error in fetchAiDecisions:', err);
    return [];
  }
};
