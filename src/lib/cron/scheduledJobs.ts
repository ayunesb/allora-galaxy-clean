import { updateKPIs } from '../kpi/updateKPIs';
import { syncMQLs } from '../kpi/syncMQLs';
import { cleanupLogs } from '../system/cleanupLogs';
// Import autoEvolveAgents only if we're going to use it
// import { autoEvolveAgents } from '../agents/evolution/autoEvolveAgents';

/**
 * Schedule all background jobs
 */
export function scheduleJobs() {
  // Schedule KPI updates (daily)
  scheduleJob('update-kpis', '0 0 * * *', updateKPIs);
  
  // Schedule MQL sync (weekly)
  scheduleJob('sync-mqls', '0 0 * * 0', syncMQLs);
  
  // Schedule log cleanup (weekly)
  scheduleJob('cleanup-logs', '0 0 * * 0', cleanupLogs);
  
  // Uncomment when ready to use auto evolution
  // scheduleJob('auto-evolve-agents', '0 12 * * *', autoEvolveAgents);
}

/**
 * Helper function to schedule a job
 */
function scheduleJob(name: string, cronPattern: string, jobFunction: Function) {
  try {
    console.log(`Scheduling ${name} with pattern ${cronPattern}`);
    // This would be replaced with actual CRON implementation
    // cron.schedule(cronPattern, jobFunction);
  } catch (error) {
    console.error(`Error scheduling ${name}:`, error);
  }
}
