
import { supabase } from '@/integrations/supabase/client';
import { CronJob, CronExecution } from '@/types/admin/cronJobs';
import { notifySuccess, notifyError } from '@/lib/admin/notifications';

/**
 * Fetch all cron jobs from the database
 */
export async function fetchJobs() {
  try {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching cron jobs:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Fetch executions for a specific job
 * @param jobId The ID of the job to fetch executions for
 */
export async function fetchExecutions(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('cron_executions')
      .select('*')
      .eq('job_id', jobId)
      .order('start_time', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching executions:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Pause a cron job
 * @param jobId The ID of the job to pause
 */
export async function pauseJob(jobId: string) {
  try {
    const { error } = await supabase
      .from('cron_jobs')
      .update({ status: 'inactive' })
      .eq('id', jobId);
    
    if (error) throw error;
    notifySuccess('Job paused successfully');
    return { success: true, error: null };
  } catch (err) {
    notifyError('Failed to pause job');
    console.error('Error pausing job:', err);
    return { success: false, error: err };
  }
}

/**
 * Resume a cron job
 * @param jobId The ID of the job to resume
 */
export async function resumeJob(jobId: string) {
  try {
    const { error } = await supabase
      .from('cron_jobs')
      .update({ status: 'active' })
      .eq('id', jobId);
    
    if (error) throw error;
    notifySuccess('Job resumed successfully');
    return { success: true, error: null };
  } catch (err) {
    notifyError('Failed to resume job');
    console.error('Error resuming job:', err);
    return { success: false, error: err };
  }
}

/**
 * Run a cron job immediately
 * @param jobId The ID of the job to run
 */
export async function runJob(jobId: string) {
  try {
    const { error } = await supabase.functions.invoke('triggerCronJob', {
      body: { jobId }
    });
    
    if (error) throw error;
    notifySuccess('Job triggered successfully');
    return { success: true, error: null };
  } catch (err) {
    notifyError('Failed to trigger job');
    console.error('Error triggering job:', err);
    return { success: false, error: err };
  }
}
