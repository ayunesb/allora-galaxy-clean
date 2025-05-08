
import { supabase } from '@/integrations/supabase/client';
import { autoEvolveAgents } from '@/lib/agents/evolution/autoEvolveAgents';
import { EvolutionResult } from '@/lib/agents/evolution/createEvolvedAgent';

/**
 * Run the agent auto-evolution process
 * This is typically scheduled to run daily or weekly
 */
export async function runAutoEvolution() {
  try {
    console.log('Starting auto-evolution job...');
    
    // Get all tenants
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('status', 'active');
    
    if (tenantError) {
      throw tenantError;
    }
    
    if (!tenants || tenants.length === 0) {
      console.log('No active tenants found');
      return;
    }
    
    console.log(`Found ${tenants.length} active tenants`);
    
    // Process each tenant
    for (const tenant of tenants) {
      try {
        console.log(`Processing tenant: ${tenant.name} (${tenant.id})`);
        
        const results = await autoEvolveAgents(tenant.id);
        
        // Count successful evolutions
        const successCount = results.filter(result => result.success).length;
        
        console.log(`Auto-evolution completed for tenant ${tenant.name}: ${successCount} agents evolved`);
        
        // Log activity
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: tenant.id,
            module: 'agent',
            event: 'auto_evolve_completed',
            context: {
              total_agents_checked: results.length,
              successful_evolutions: successCount,
              errors: results.filter(r => !r.success).map(r => r.error)
            }
          });
      } catch (tenantError) {
        console.error(`Error processing tenant ${tenant.id}:`, tenantError);
      }
    }
    
    console.log('Auto-evolution job completed');
  } catch (error) {
    console.error('Error running auto-evolution job:', error);
  }
}

/**
 * Schedule database maintenance tasks
 * This is typically run weekly during off-hours
 */
export async function runDatabaseMaintenance() {
  try {
    console.log('Starting database maintenance job...');
    
    // Clean up old logs
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('cleanup_old_logs', { days_to_keep: 90 });
    
    if (cleanupError) {
      throw cleanupError;
    }
    
    console.log('Database maintenance job completed:', cleanupResult);
  } catch (error) {
    console.error('Error running database maintenance job:', error);
  }
}
