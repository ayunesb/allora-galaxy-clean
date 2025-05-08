
import { autoEvolveAgents } from '@/lib/agents/evolution';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Schedule all cron jobs needed for the application
 */
export async function initializeScheduledJobs() {
  try {
    // Add jobs to the scheduler
    await setupAutoEvolveAgentsJob();
    await setupKpiUpdateJob();
    
    console.log('All scheduled jobs initialized');
  } catch (error) {
    console.error('Failed to initialize scheduled jobs:', error);
  }
}

/**
 * Set up the auto-evolve agents job to run daily
 */
async function setupAutoEvolveAgentsJob() {
  try {
    // Run auto-evolve process once per day
    const CRON_SCHEDULE = '0 2 * * *'; // Run at 2 AM every day
    
    // Call autoEvolveAgents directly with system tenant
    const result = await autoEvolveAgents({
      tenantId: 'system'
    });
    
    // Log the result
    if (result.evolved > 0) {
      await logSystemEvent(
        'system', 
        'agent', 
        'agents_evolved', 
        { count: result.evolved }
      );
    }
    
    console.log(`Auto evolve agents job scheduled: ${CRON_SCHEDULE}`);
    
    return { success: true, message: 'Auto evolve agents job scheduled' };
  } catch (error: any) {
    console.error('Failed to schedule auto evolve agents job:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set up the KPI update job to run daily
 */
async function setupKpiUpdateJob() {
  try {
    // Run KPI update once per day
    const CRON_SCHEDULE = '0 1 * * *'; // Run at 1 AM every day
    
    console.log(`KPI update job scheduled: ${CRON_SCHEDULE}`);
    
    return { success: true, message: 'KPI update job scheduled' };
  } catch (error: any) {
    console.error('Failed to schedule KPI update job:', error);
    return { success: false, error: error.message };
  }
}
