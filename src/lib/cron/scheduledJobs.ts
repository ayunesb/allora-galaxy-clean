
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface JobDefinition {
  id: string;
  name: string;
  description: string;
  schedule: string; // cron syntax
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  function_name: string;
  tenant_id: string;
}

/**
 * Register a new scheduled job in the system
 */
export async function registerScheduledJob(job: Omit<JobDefinition, 'id'>): Promise<string | null> {
  try {
    // Calculate next run time based on cron syntax (simplified)
    const nextRun = calculateNextRunTime(job.schedule);
    
    const { data, error } = await supabase
      .from('scheduled_jobs')
      .insert({
        ...job,
        next_run: nextRun.toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error registering scheduled job:", error);
      
      await logSystemEvent(
        job.tenant_id,
        'cron',
        'job_registration_failed',
        { name: job.name, error: error.message }
      );
      
      return null;
    }
    
    await logSystemEvent(
      job.tenant_id,
      'cron',
      'job_registered',
      { name: job.name, schedule: job.schedule, function: job.function_name }
    );
    
    return data.id;
  } catch (err: any) {
    console.error("Unexpected error in registerScheduledJob:", err);
    return null;
  }
}

/**
 * Pause a scheduled job
 */
export async function pauseScheduledJob(jobId: string, tenant_id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scheduled_jobs')
      .update({ enabled: false })
      .eq('id', jobId)
      .eq('tenant_id', tenant_id);
      
    if (error) {
      console.error("Error pausing scheduled job:", error);
      
      await logSystemEvent(
        tenant_id,
        'cron',
        'job_pause_failed',
        { job_id: jobId, error: error.message }
      );
      
      return false;
    }
    
    await logSystemEvent(
      tenant_id,
      'cron',
      'job_paused',
      { job_id: jobId }
    );
    
    return true;
  } catch (err: any) {
    console.error("Unexpected error in pauseScheduledJob:", err);
    return false;
  }
}

/**
 * Resume a paused scheduled job
 */
export async function resumeScheduledJob(jobId: string, tenant_id: string): Promise<boolean> {
  try {
    // Calculate next run time
    const { data: job, error: fetchError } = await supabase
      .from('scheduled_jobs')
      .select('schedule')
      .eq('id', jobId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching job schedule:", fetchError);
      return false;
    }
    
    const nextRun = calculateNextRunTime(job.schedule);
    
    const { error } = await supabase
      .from('scheduled_jobs')
      .update({ 
        enabled: true,
        next_run: nextRun.toISOString()
      })
      .eq('id', jobId)
      .eq('tenant_id', tenant_id);
      
    if (error) {
      console.error("Error resuming scheduled job:", error);
      
      await logSystemEvent(
        tenant_id,
        'cron',
        'job_resume_failed',
        { job_id: jobId, error: error.message }
      );
      
      return false;
    }
    
    await logSystemEvent(
      tenant_id,
      'cron',
      'job_resumed',
      { job_id: jobId }
    );
    
    return true;
  } catch (err: any) {
    console.error("Unexpected error in resumeScheduledJob:", err);
    return false;
  }
}

/**
 * Delete a scheduled job
 */
export async function deleteScheduledJob(jobId: string, tenant_id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scheduled_jobs')
      .delete()
      .eq('id', jobId)
      .eq('tenant_id', tenant_id);
      
    if (error) {
      console.error("Error deleting scheduled job:", error);
      
      await logSystemEvent(
        tenant_id,
        'cron',
        'job_deletion_failed',
        { job_id: jobId, error: error.message }
      );
      
      return false;
    }
    
    await logSystemEvent(
      tenant_id,
      'cron',
      'job_deleted',
      { job_id: jobId }
    );
    
    return true;
  } catch (err: any) {
    console.error("Unexpected error in deleteScheduledJob:", err);
    return false;
  }
}

/**
 * Trigger a job to run immediately
 */
export async function triggerJobNow(jobId: string, tenant_id: string): Promise<boolean> {
  try {
    // Get the job details
    const { data: job, error: fetchError } = await supabase
      .from('scheduled_jobs')
      .select('function_name')
      .eq('id', jobId)
      .eq('tenant_id', tenant_id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching job details:", fetchError);
      return false;
    }
    
    // Call the edge function
    const { error } = await supabase.functions.invoke(job.function_name, {
      body: JSON.stringify({ 
        tenant_id,
        triggered_manually: true,
        job_id: jobId
      })
    });
    
    if (error) {
      console.error("Error triggering job function:", error);
      
      await logSystemEvent(
        tenant_id,
        'cron',
        'job_manual_trigger_failed',
        { job_id: jobId, error: String(error) }
      );
      
      return false;
    }
    
    // Update last_run time
    await supabase
      .from('scheduled_jobs')
      .update({ last_run: new Date().toISOString() })
      .eq('id', jobId);
    
    await logSystemEvent(
      tenant_id,
      'cron',
      'job_manually_triggered',
      { job_id: jobId }
    );
    
    return true;
  } catch (err: any) {
    console.error("Unexpected error in triggerJobNow:", err);
    return false;
  }
}

/**
 * Calculate next run time based on cron syntax (simplified)
 * In a real implementation, use a proper cron parser library
 */
function calculateNextRunTime(cronSyntax: string): Date {
  // This is a simplified placeholder implementation
  // In a real system, you would use a proper cron parser
  
  // For now, just add 1 day to current time as placeholder
  const nextRun = new Date();
  nextRun.setDate(nextRun.getDate() + 1);
  return nextRun;
}

/**
 * List all scheduled jobs for a tenant
 */
export async function listScheduledJobs(tenant_id: string): Promise<JobDefinition[]> {
  try {
    const { data, error } = await supabase
      .from('scheduled_jobs')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('name');
      
    if (error) {
      console.error("Error listing scheduled jobs:", error);
      return [];
    }
    
    return data || [];
  } catch (err: any) {
    console.error("Unexpected error in listScheduledJobs:", err);
    return [];
  }
}
