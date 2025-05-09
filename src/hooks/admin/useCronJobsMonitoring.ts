
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CronJob {
  id: string;
  job_name: string;
  execution_time: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
}

export interface CronJobStats {
  job_name: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_ms: number | null;
  last_execution: string | null;
}

export const useCronJobsMonitoring = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<CronJobStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');

  const fetchJobs = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('cron_job_executions')
        .select('*')
        .order('execution_time', { ascending: false });

      if (jobsError) {
        setError(jobsError.message);
        toast({
          title: "Error",
          description: `Failed to fetch jobs: ${jobsError.message}`,
          variant: "destructive"
        });
      } else {
        setJobs(jobsData || []);
      }

      // Fetch job statistics
      const { data: statsData, error: statsError } = await supabase
        .from('cron_job_stats')
        .select('*');

      if (statsError) {
        setError(statsError.message);
        toast({
          title: "Error",
          description: `Failed to fetch job statistics: ${statsError.message}`,
          variant: "destructive"
        });
      } else {
        setStats(statsData || []);
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [timeRange]);

  // Replace the toast calls to include the required title property
  const toggleJobStatus = async (jobId: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('cron_jobs')
        .update({ is_enabled: !isEnabled })
        .eq('id', jobId);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to update job status: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      await fetchJobs();
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const refreshData = () => {
    fetchJobs();
  };

  const runJob = async (jobId: string) => {
    try {
      const { error } = await supabase.functions.invoke('trigger-cron-job', {
        body: { job_id: jobId }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to trigger job: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Job triggered successfully"
      });
      await fetchJobs();
    } catch (err) {
      toast({
        title: "Error", 
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    }
  };

  // Alias for runJob to match the component expectations
  const runCronJob = runJob;

  // Update logSystemEvent call to ensure it has the correct parameters
  const logSystemEvent = (
    eventType: string,
    description: string,
    metadata: Record<string, any> = {},
    level: 'info' | 'warn' | 'error' = 'info'
  ) => {
    supabase.from('system_logs').insert([
      {
        tenant_id: 'public',
        module: 'cron_jobs',
        type: eventType,
        level: level,
        description: description,
        metadata: metadata,
        user_id: supabase.auth.getUser().then(({ data }) => data?.user?.id) || null,
      },
    ]);
  };

  return {
    jobs,
    stats,
    loading,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    fetchJobs,
    refreshData,
    toggleJobStatus,
    runJob,
    runCronJob,
    logSystemEvent,
  };
};
