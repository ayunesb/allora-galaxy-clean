
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { toast } from '@/components/ui/use-toast';

export type CronJob = {
  id: string;
  job_name: string;
  execution_time: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
};

export type CronJobStats = {
  job_name: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_ms: number | null;
  last_execution: string | null;
};

export const useCronJobsMonitoring = () => {
  const tenantId = useTenantId();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<CronJobStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');

  const logSystemEvent = (module: string, level: string, message: string) => {
    // We are not implementing the logging to the database here
    // This is just to satisfy the type requirements
    console.log(`[${module}] [${level}] ${message}`);
  };

  const fetchData = async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the date range based on the selected time range
      let startDate: string | null = null;
      const now = new Date();
      
      if (timeRange === '24h') {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        startDate = yesterday.toISOString();
      } else if (timeRange === '7d') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = lastWeek.toISOString();
      } else if (timeRange === '30d') {
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = lastMonth.toISOString();
      }
      
      // Fetch cron job executions
      let query = supabase
        .from('cron_job_executions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('execution_time', { ascending: false });
      
      if (startDate && timeRange !== 'all') {
        query = query.gte('execution_time', startDate);
      }
      
      const { data: jobsData, error: jobsError } = await query;
      
      if (jobsError) {
        throw jobsError;
      }
      
      setJobs(jobsData || []);
      
      // Calculate statistics based on the fetched data
      const jobsMap = new Map<string, CronJobStats>();
      
      jobsData?.forEach((job: CronJob) => {
        const existing = jobsMap.get(job.job_name) || {
          job_name: job.job_name,
          total_executions: 0,
          successful_executions: 0,
          failed_executions: 0,
          avg_duration_ms: 0,
          last_execution: null
        };
        
        existing.total_executions += 1;
        
        if (job.status === 'completed') {
          existing.successful_executions += 1;
        } else if (job.status === 'failed') {
          existing.failed_executions += 1;
        }
        
        // Update average duration (only for completed jobs with duration)
        if (job.status === 'completed' && job.duration_ms !== null) {
          const totalDuration = (existing.avg_duration_ms || 0) * (existing.successful_executions - 1) + job.duration_ms;
          existing.avg_duration_ms = totalDuration / existing.successful_executions;
        }
        
        // Track the most recent execution
        if (!existing.last_execution || new Date(job.execution_time) > new Date(existing.last_execution)) {
          existing.last_execution = job.execution_time;
        }
        
        jobsMap.set(job.job_name, existing);
      });
      
      setStats(Array.from(jobsMap.values()));
      
    } catch (err: any) {
      console.error('Error fetching CRON jobs data:', err);
      setError(err.message);
      logSystemEvent('cron', 'error', `Failed to fetch CRON jobs: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, timeRange]);

  const refreshData = () => {
    fetchData();
  };

  const runCronJob = async (jobName: string) => {
    if (!tenantId) return;
    
    try {
      // In a real implementation, this would trigger the job execution via an edge function
      // For this example, we'll just log the attempt and simulate success
      logSystemEvent('cron', 'info', `Manual execution triggered for job: ${jobName}`);
      
      // Add a new execution entry
      const newExecution = {
        tenant_id: tenantId,
        job_name: jobName,
        status: 'started',
        execution_time: new Date().toISOString(),
      };
      
      const { error: insertError } = await supabase
        .from('cron_job_executions')
        .insert(newExecution);
      
      if (insertError) throw insertError;
      
      toast({
        title: "Job execution started",
        description: `${jobName} has been triggered manually.`
      });
      
      // Refresh data after a short delay to show the new execution
      setTimeout(fetchData, 1000);
      
    } catch (err: any) {
      console.error('Error running CRON job:', err);
      setError(err.message);
      toast({
        title: "Error running job",
        description: err.message,
        variant: "destructive"
      });
      logSystemEvent('cron', 'error', `Failed to run CRON job ${jobName}: ${err.message}`);
    }
  };

  return {
    jobs,
    stats,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    refreshData,
    runCronJob
  };
};

export default useCronJobsMonitoring;
