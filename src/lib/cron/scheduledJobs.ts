
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { autoEvolveAgents } from '@/lib/agents/evolution/autoEvolveAgents';

/**
 * Run scheduled jobs for a tenant
 * @param tenantId Tenant ID to run jobs for
 */
export async function runScheduledJobs(tenantId: string) {
  try {
    await logSystemEvent(
      'system',
      'info',
      {
        event: 'scheduled_jobs_started',
        tenant_id: tenantId
      },
      tenantId
    );

    // Run auto evolution of agents
    const evolutionResult = await autoEvolveAgents(tenantId);
    
    // Update KPIs via edge function
    const { error: kpiError } = await supabase.functions.invoke('updateKPIs', {
      body: { tenant_id: tenantId }
    });
    
    if (kpiError) {
      await logSystemEvent(
        'kpi',
        'error',
        {
          event: 'update_kpis_failed',
          tenant_id: tenantId,
          error: kpiError.message
        },
        tenantId
      );
    }
    
    await logSystemEvent(
      'system',
      'info',
      {
        event: 'scheduled_jobs_completed',
        tenant_id: tenantId,
        evolution_result: evolutionResult.success ? 'success' : 'failure',
        kpi_update: kpiError ? 'failure' : 'success'
      },
      tenantId
    );

    return {
      success: true,
      evolutionResult,
      kpiUpdateSuccess: !kpiError
    };
  } catch (error: any) {
    await logSystemEvent(
      'system',
      'error',
      {
        event: 'scheduled_jobs_failed',
        tenant_id: tenantId,
        error: error.message
      },
      tenantId
    );

    return {
      success: false,
      error: error.message
    };
  }
}
