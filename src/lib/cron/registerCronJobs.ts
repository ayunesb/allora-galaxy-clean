
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface CronJobRegistration {
  name: string;
  schedule: string;
  description: string;
  functionName: string;
  defaultPayload?: Record<string, any>;
  isPublic?: boolean;
}

/**
 * Comprehensive list of all scheduled jobs in the system
 * This serves as a registry for all CRON jobs
 */
export const SYSTEM_CRON_JOBS: CronJobRegistration[] = [
  {
    name: 'update_kpis_daily',
    schedule: '0 0 * * *', // Daily at midnight
    description: 'Daily update of KPI metrics for all tenants',
    functionName: 'updateKPIs',
    defaultPayload: { check_all_tenants: true, run_mode: 'scheduled' }
  },
  {
    name: 'sync_mqls_weekly',
    schedule: '0 2 * * 1', // Weekly on Monday at 2 AM
    description: 'Weekly synchronization of Marketing Qualified Leads',
    functionName: 'syncMQLs',
    defaultPayload: { check_all_tenants: true, run_mode: 'scheduled' }
  },
  {
    name: 'auto_evolve_agents_daily',
    schedule: '0 3 * * *', // Daily at 3 AM
    description: 'Automated evolution of agents based on performance',
    functionName: 'autoEvolveAgents',
    defaultPayload: { check_all_tenants: true, run_mode: 'scheduled' }
  },
  {
    name: 'scheduled-intelligence-daily',
    schedule: '0 4 * * *', // Daily at 4 AM
    description: 'Daily intelligence processing and analytics',
    functionName: 'scheduledIntelligence',
    defaultPayload: { type: 'daily_run', manual_trigger: false }
  },
  {
    name: 'cleanup_old_execution_logs',
    schedule: '0 1 * * 0', // Weekly on Sunday at 1 AM
    description: 'Cleanup of old execution logs and system logs',
    functionName: 'triggerCronJob',
    defaultPayload: { job_name: 'cleanup_old_execution_logs', retention_days: 30 }
  },
  {
    name: 'send_milestone_alerts',
    schedule: '0 9 * * *', // Daily at 9 AM
    description: 'Send milestone alerts for achievements and KPIs',
    functionName: 'sendMilestoneAlerts',
    defaultPayload: { type: 'system_check' }
  }
];

/**
 * Deploy CRON jobs to the Supabase database
 * This function is meant to be called during system setup
 * @returns Result of the operation
 */
export async function deployCronJobs(): Promise<{ 
  success: boolean; 
  deployed: string[]; 
  failed: string[]; 
  error?: string 
}> {
  const deployed: string[] = [];
  const failed: string[] = [];

  try {
    // Call a stored procedure to register all CRON jobs in the database
    const { data, error } = await supabase.rpc(
      'register_system_cron_jobs',
      {
        jobs: JSON.stringify(SYSTEM_CRON_JOBS)
      }
    );
    
    if (error) {
      console.error('Error deploying CRON jobs:', error);
      throw error;
    }
    
    if (data?.registered_jobs) {
      deployed.push(...data.registered_jobs);
    }
    
    if (data?.failed_jobs) {
      failed.push(...data.failed_jobs);
    }
    
    toast({
      title: 'CRON Jobs Deployed',
      description: `Successfully deployed ${deployed.length} CRON jobs`,
      variant: 'default'
    });
    
    return {
      success: true,
      deployed,
      failed
    };
  } catch (err: any) {
    console.error('Error deploying CRON jobs:', err);
    
    toast({
      title: 'Failed to Deploy CRON Jobs',
      description: err.message || 'An unexpected error occurred',
      variant: 'destructive'
    });
    
    return {
      success: false,
      deployed,
      failed: [...failed, ...SYSTEM_CRON_JOBS.map(job => job.name)],
      error: err.message
    };
  }
}

/**
 * Get the status of all registered CRON jobs
 * @returns Status of all CRON jobs
 */
export async function getCronJobStatus(): Promise<{
  active: string[];
  inactive: string[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('get_cron_job_status');
    
    if (error) {
      throw error;
    }
    
    // Compare registered jobs with our system registry
    const registeredJobs = data?.active_jobs || [];
    const allSystemJobs = SYSTEM_CRON_JOBS.map(job => job.name);
    
    const active = registeredJobs;
    const inactive = allSystemJobs.filter(job => !registeredJobs.includes(job));
    
    return {
      active,
      inactive
    };
  } catch (err: any) {
    console.error('Error getting CRON job status:', err);
    
    return {
      active: [],
      inactive: SYSTEM_CRON_JOBS.map(job => job.name),
      error: err.message
    };
  }
}

/**
 * Trigger a specific CRON job manually
 * @param jobName Name of the job to trigger
 * @param options Additional options for the job
 * @returns Result of the operation
 */
export async function triggerCronJob(
  jobName: string,
  options?: Record<string, any>
): Promise<{
  success: boolean;
  jobId?: string;
  executionTime?: number;
  error?: string;
}> {
  try {
    // Validate that the job exists in our registry
    const jobDefinition = SYSTEM_CRON_JOBS.find(job => job.name === jobName);
    if (!jobDefinition) {
      throw new Error(`Unknown job: ${jobName}`);
    }
    
    console.log(`Triggering CRON job: ${jobName}`);
    
    // Call the triggerCronJob edge function
    const { data, error } = await supabase.functions.invoke('triggerCronJob', {
      body: { 
        job_name: jobName,
        manual_trigger: true,
        options
      }
    });
    
    if (error) {
      throw error;
    }
    
    toast({
      title: 'Job Triggered',
      description: `${jobName} has been triggered successfully`,
      variant: 'default'
    });
    
    return {
      success: true,
      jobId: data.job_id,
      executionTime: data.execution_time_ms
    };
  } catch (err: any) {
    console.error(`Error triggering CRON job ${jobName}:`, err);
    
    toast({
      title: 'Failed to Trigger Job',
      description: err.message || 'An unexpected error occurred',
      variant: 'destructive'
    });
    
    return {
      success: false,
      error: err.message
    };
  }
}
