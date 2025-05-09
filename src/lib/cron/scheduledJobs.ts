import { autoEvolveAgents } from '@/lib/agents/evolution';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Register scheduled jobs for periodic execution
 */
export function registerScheduledJobs(): void {
  // Register scheduled jobs for cross-tenant operations
  registerAutoEvolutionJob();
}

/**
 * Register the agent auto-evolution job
 */
function registerAutoEvolutionJob(): void {
  try {
    // Perform agent evolution checks and upgrades
    setInterval(async () => {
      try {
        await autoEvolveAgents();
      } catch (error) {
        console.error('Error in autoEvolveAgents job:', error);
        await logSystemEvent('system', 'error', {
          job: 'autoEvolveAgents',
          error: String(error)
        });
      }
    }, 24 * 60 * 60 * 1000); // Run once per day
    
    console.log('Agent auto-evolution job scheduled');
  } catch (error) {
    console.error('Failed to register auto evolution job:', error);
  }
}
