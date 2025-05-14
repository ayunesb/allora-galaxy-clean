
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { CronJob, CronJobStat, TimeRange } from '@/types/cron';

// Return type for the hook
export interface UseCronJobsMonitoringResult {
  jobs: CronJob[];
  stats: CronJobStat[];
  isLoading: boolean;
  error: Error | null;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  fetchJobs: () => Promise<void>;
  runJob: (jobId: string) => Promise<void>;
}

export const useCronJobsMonitoring = (): UseCronJobsMonitoringResult => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<CronJobStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    value: 'day',
    label: 'Last 24 hours'
  });

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch cron jobs
      const { data, error } = await supabase
        .from('cron_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setJobs(data || []);
      
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_cron_job_stats', { time_range: timeRange.value });
        
      if (statsError) throw statsError;
      
      setStats(statsData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cron jobs'));
      toast({
        title: "Error",
        description: "Failed to fetch cron jobs data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeRange.value]);
  
  const runJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .functions.invoke('triggerCronJob', {
          body: { job_id: jobId }
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Job triggered successfully",
      });
      
      // Refresh the jobs list after a short delay
      setTimeout(fetchJobs, 1000);
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to trigger job",
        variant: "destructive",
      });
    }
  };
  
  // Fetch jobs on mount and when timeRange changes
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  return {
    jobs,
    stats,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    fetchJobs,
    runJob
  };
};

export default useCronJobsMonitoring;
