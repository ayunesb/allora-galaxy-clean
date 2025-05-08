
import { autoEvolveAgents } from '../agents/evolution';
import { notifyAndLog } from '../notifications/notifyAndLog';

// This is a simple scheduler for jobs that need to run periodically
// In production, these would be handled by Supabase's cron jobs or a proper scheduler

export interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  schedule: string; // Cron expression format
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  handler: () => Promise<any>;
}

/**
 * List of available scheduled jobs
 */
export const scheduledJobs: ScheduledJob[] = [
  {
    id: 'auto-evolve-agents',
    name: 'Auto Evolve Agents',
    description: 'Analyzes agent performance and evolves agents when needed',
    schedule: '0 3 * * *', // Every day at 3 AM
    enabled: true,
    handler: async () => {
      const tenantIds = ['system']; // In production, would fetch active tenant IDs
      
      for (const tenantId of tenantIds) {
        try {
          const result = await autoEvolveAgents(tenantId);
          return {
            success: result.success,
            evolved: result.evolved,
            errors: result.errors
          };
        } catch (error: any) {
          console.error('Auto evolve job failed:', error);
          await notifyAndLog(
            'system',
            'Scheduled job failed: Auto Evolve Agents',
            error.message || 'Unknown error',
            'error'
          );
          return { success: false, error: error.message };
        }
      }
    }
  }
];

/**
 * Run a scheduled job by ID
 */
export async function runScheduledJob(jobId: string) {
  const job = scheduledJobs.find(j => j.id === jobId);
  
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  
  if (!job.enabled) {
    throw new Error(`Job ${jobId} is disabled`);
  }
  
  try {
    job.lastRun = new Date();
    const result = await job.handler();
    return { success: true, result };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred while running the job' 
    };
  }
}
