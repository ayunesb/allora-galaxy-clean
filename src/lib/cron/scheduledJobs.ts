
import { supabase } from '@/integrations/supabase/client';
import { autoEvolveAgents } from '@/lib/agents/evolution/autoEvolveAgents';
import { getAgentsForEvolution } from '@/lib/agents/evolution/getAgentsForEvolution';

/**
 * Schedule automatic agent evolution process
 * @param tenantId Optional tenant ID to limit the scope
 */
export async function scheduleAgentEvolution(tenantId?: string) {
  try {
    // Set up configuration for evolution
    const config = {
      minimumExecutions: 10,
      failureRateThreshold: 0.2,
      staleDays: 30,
      batchSize: 10
    };

    // Handle the case where no tenant is specified
    if (!tenantId) {
      // Get all tenants if no specific tenant was provided
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id')
        .limit(100);
        
      if (tenantsError) {
        console.error('Error fetching tenants:', tenantsError);
        return { success: false, error: tenantsError.message };
      }
      
      if (!tenants || tenants.length === 0) {
        return { success: true, message: 'No tenants found to process' };
      }
      
      // Process each tenant
      const results = [];
      for (const tenant of tenants) {
        const agentsToEvolve = await getAgentsForEvolution(tenant.id);
        const evolutionResult = await autoEvolveAgents(agentsToEvolve, tenant.id);
        results.push({ 
          tenant_id: tenant.id, 
          evolved: evolutionResult.evolved,
          success: evolutionResult.success
        });
      }
      
      return { 
        success: true, 
        message: `Processed ${tenants.length} tenants`, 
        results 
      };
    } else {
      // Process specific tenant
      const agentsToEvolve = await getAgentsForEvolution(tenantId);
      
      if (!agentsToEvolve || agentsToEvolve.length === 0) {
        return { success: true, message: 'No agents found for evolution' };
      }
      
      const result = await autoEvolveAgents(agentsToEvolve, tenantId);
      return {
        success: result.success,
        evolved: result.evolved,
        message: result.message
      };
    }
  } catch (error: any) {
    console.error('Error in scheduleAgentEvolution:', error);
    return { success: false, error: error.message };
  }
}
