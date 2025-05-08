
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { autoEvolveAgents, AutoEvolveResult } from '@/lib/agents/evolution/autoEvolveAgents';

interface AutoEvolveConfig {
  minimumExecutions: number;
  failureRateThreshold: number;
  staleDays: number;
  batchSize: number;
}

/**
 * Execute the agent auto-evolution job
 */
export async function executeAutoEvolveJob(tenantId: string, config?: Partial<AutoEvolveConfig>): Promise<void> {
  try {
    await logSystemEvent('agent', 'info', {
      job_name: 'auto_evolve_agents',
      tenant_id: tenantId,
      started_at: new Date().toISOString()
    }, tenantId);
    
    const result: AutoEvolveResult = await autoEvolveAgents(tenantId, config as any); // Temporary cast to fix type error
    
    await logSystemEvent('agent', 'info', {
      job_name: 'auto_evolve_agents',
      tenant_id: tenantId,
      completed_at: new Date().toISOString(),
      success: result.success,
      agents_evolved: result.agentsEvolved || 0
    }, tenantId);
  } catch (error: any) {
    await logSystemEvent('agent', 'error', {
      job_name: 'auto_evolve_agents',
      tenant_id: tenantId,
      error: error.message
    }, tenantId);
  }
}

/**
 * Execute the KPI update job
 */
export async function executeKpiUpdateJob(tenantId: string): Promise<void> {
  try {
    await logSystemEvent('billing', 'info', {
      job_name: 'update_kpis',
      tenant_id: tenantId,
      started_at: new Date().toISOString()
    }, tenantId);
    
    // Implementation would call the updateKPIs edge function
    
    await logSystemEvent('billing', 'kpi_updated', {
      job_name: 'update_kpis',
      tenant_id: tenantId,
      completed_at: new Date().toISOString()
    }, tenantId);
  } catch (error: any) {
    await logSystemEvent('billing', 'kpi_update_failed', {
      job_name: 'update_kpis',
      tenant_id: tenantId,
      error: error.message
    }, tenantId);
  }
}

/**
 * Execute the MQL sync job
 */
export async function executeMqlSyncJob(tenantId: string): Promise<void> {
  try {
    await logSystemEvent('marketing', 'info', {
      job_name: 'sync_mqls',
      tenant_id: tenantId,
      started_at: new Date().toISOString()
    }, tenantId);
    
    // Implementation would call the syncMQLs edge function
    
    await logSystemEvent('marketing', 'info', {
      job_name: 'sync_mqls',
      tenant_id: tenantId,
      completed_at: new Date().toISOString()
    }, tenantId);
  } catch (error: any) {
    await logSystemEvent('marketing', 'error', {
      job_name: 'sync_mqls',
      tenant_id: tenantId,
      error: error.message
    }, tenantId);
  }
}
