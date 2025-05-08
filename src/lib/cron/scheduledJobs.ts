
// Remove unused variable 'cronSyntax'
import { supabase } from '@/lib/supabase';
import { autoEvolveAgents } from '@/lib/agents/evolution/autoEvolveAgents';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Initialize all scheduled jobs
 * This is typically called when the application starts
 */
export async function initializeScheduledJobs() {
  try {
    await setupKpiUpdateJob();
    await setupMqlSyncJob();
    await setupAutoEvolveJob();
    await setupLogCleanupJob();
    
    return { success: true };
  } catch (error: any) {
    console.error('Error initializing scheduled jobs:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Setup the daily KPI update job
 */
async function setupKpiUpdateJob() {
  try {
    // Check if job already exists
    const { data: existingJob, error: checkError } = await supabase
      .from('cron_jobs')
      .select('id')
      .eq('name', 'update_kpis_daily')
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingJob) {
      console.log('KPI update job already exists, skipping setup');
      return;
    }
    
    // Create the daily KPI update job (midnight UTC)
    const { error } = await supabase.rpc('create_cron_job', {
      job_name: 'update_kpis_daily',
      schedule: '0 0 * * *',
      function_name: 'updateKPIs',
      parameters: {}
    });
    
    if (error) throw error;
    
    await logSystemEvent('system', 'cron', 'kpi_update_job_created', {});
  } catch (error) {
    console.error('Error setting up KPI update job:', error);
    throw error;
  }
}

/**
 * Setup the weekly MQL sync job
 */
async function setupMqlSyncJob() {
  try {
    // Check if job already exists
    const { data: existingJob, error: checkError } = await supabase
      .from('cron_jobs')
      .select('id')
      .eq('name', 'sync_mqls_weekly')
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingJob) {
      console.log('MQL sync job already exists, skipping setup');
      return;
    }
    
    // Create the weekly MQL sync job (Monday 6am UTC)
    const { error } = await supabase.rpc('create_cron_job', {
      job_name: 'sync_mqls_weekly',
      schedule: '0 6 * * 1',
      function_name: 'syncMQLs',
      parameters: {}
    });
    
    if (error) throw error;
    
    await logSystemEvent('system', 'cron', 'mql_sync_job_created', {});
  } catch (error) {
    console.error('Error setting up MQL sync job:', error);
    throw error;
  }
}

/**
 * Setup the daily agent auto-evolution job
 */
async function setupAutoEvolveJob() {
  try {
    // Check if job already exists
    const { data: existingJob, error: checkError } = await supabase
      .from('cron_jobs')
      .select('id')
      .eq('name', 'auto_evolve_agents_daily')
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingJob) {
      console.log('Agent evolution job already exists, skipping setup');
      return;
    }
    
    // Create the daily agent evolution job (3am UTC)
    const { error } = await supabase.rpc('create_cron_job', {
      job_name: 'auto_evolve_agents_daily',
      schedule: '0 3 * * *',
      function_name: 'autoEvolveAgents',
      parameters: {}
    });
    
    if (error) throw error;
    
    await logSystemEvent('system', 'cron', 'agent_evolution_job_created', {});
  } catch (error) {
    console.error('Error setting up agent evolution job:', error);
    throw error;
  }
}

/**
 * Setup the weekly log cleanup job
 */
async function setupLogCleanupJob() {
  try {
    // Check if job already exists
    const { data: existingJob, error: checkError } = await supabase
      .from('cron_jobs')
      .select('id')
      .eq('name', 'cleanup_old_execution_logs')
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingJob) {
      console.log('Log cleanup job already exists, skipping setup');
      return;
    }
    
    // Create the weekly log cleanup job (Sunday 2am UTC)
    const { error } = await supabase.rpc('create_cron_job', {
      job_name: 'cleanup_old_execution_logs',
      schedule: '0 2 * * 0',
      function_name: 'cleanupLogs',
      parameters: { retention_days: 30 }
    });
    
    if (error) throw error;
    
    await logSystemEvent('system', 'cron', 'log_cleanup_job_created', {});
  } catch (error) {
    console.error('Error setting up log cleanup job:', error);
    throw error;
  }
}

/**
 * Setup a custom scheduled job
 */
export async function createScheduledJob(
  name: string,
  schedule: string,
  functionName: string,
  parameters: Record<string, any> = {}
) {
  try {
    // Validate the job name
    if (!name || name.trim() === '') {
      throw new Error('Job name is required');
    }
    
    // Validate the schedule (basic validation)
    if (!schedule || schedule.trim() === '') {
      throw new Error('Schedule is required');
    }
    
    // Check if job already exists
    const { data: existingJob, error: checkError } = await supabase
      .from('cron_jobs')
      .select('id')
      .eq('name', name)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingJob) {
      throw new Error(`Job with name "${name}" already exists`);
    }
    
    // Create the scheduled job
    const { error } = await supabase.rpc('create_cron_job', {
      job_name: name,
      schedule: schedule, // e.g., '0 0 * * *' for daily at midnight
      function_name: functionName,
      parameters: parameters
    });
    
    if (error) throw error;
    
    await logSystemEvent('system', 'cron', 'custom_job_created', {
      job_name: name,
      schedule: schedule,
      function: functionName
    });
    
    return { success: true, name, schedule, functionName };
  } catch (error: any) {
    console.error('Error creating scheduled job:', error);
    await logSystemEvent('system', 'cron', 'custom_job_creation_failed', {
      job_name: name,
      error: error.message
    });
    return { success: false, error: error.message };
  }
}
