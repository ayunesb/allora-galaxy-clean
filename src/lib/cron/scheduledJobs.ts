
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface ScheduleConfig {
  name: string;
  frequency: string;
  tenantId?: string;
}

/**
 * Register all scheduled jobs for the application
 * @param config Configuration options
 * @param scope Execution scope (server/client)
 */
export function registerScheduledJobs(config: ScheduleConfig, scope: 'server' | 'client' = 'server') {
  // Log that scheduled jobs are being registered
  logSystemEvent(
    'system',
    'scheduled_jobs_registered',
    { 
      jobName: config.name, 
      frequency: config.frequency,
      scope 
    },
    config.tenantId
  );
  
  // Implementation would go here in a real application
  console.log(`Registered ${config.name} to run ${config.frequency} in ${scope} mode`);
}

/**
 * Register the auto-evolution CRON job
 * @param tenantId The tenant ID to register the job for
 */
export function registerAutoEvolutionJob(tenantId: string) {
  return registerScheduledJobs({
    name: 'autoEvolveAgents',
    frequency: 'daily',
    tenantId,
  }, 'server');
}
