
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { autoEvolveAgents } from '@/lib/agents/evolution/autoEvolveAgents';

// Type for auto evolution result
type AutoEvolveResult = {
  success: boolean;
  evolvedAgents: number;
  errors?: string[];
};

/**
 * Run scheduled intelligence jobs
 */
export async function runScheduledIntelligence() {
  try {
    // Get all tenants that have active automation
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('status', 'active');

    if (tenantsError) {
      throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
    }

    if (!tenants || tenants.length === 0) {
      console.log('No active tenants found for scheduled intelligence');
      return;
    }

    for (const tenant of tenants) {
      try {
        // Auto-evolve agents for the tenant
        const result = await autoEvolveAgents(tenant.id);
        
        await logSystemEvent(
          'system',
          'info',
          {
            job: 'scheduledIntelligence',
            action: 'autoEvolveAgents',
            result: result
          },
          tenant.id
        );
        
        // Run other scheduled tasks here...
        
      } catch (tenantError: any) {
        await logSystemEvent(
          'system',
          'error',
          {
            job: 'scheduledIntelligence',
            tenant_id: tenant.id,
            error: tenantError.message
          },
          tenant.id
        );
      }
    }
  } catch (error: any) {
    console.error('Error in scheduled intelligence:', error);
  }
}
