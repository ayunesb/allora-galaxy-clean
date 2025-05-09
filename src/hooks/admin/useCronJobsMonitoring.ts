
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, subHours } from 'date-fns';

export interface CronJob {
  id: string;
  job_name: string;
  status: 'started' | 'completed' | 'failed';
  execution_time: string;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export const useCronJobsMonitoring = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');

  const getTimeRangeFilter = useCallback(() => {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return subHours(now, 24).toISOString();
      case '7d':
        return subDays(now, 7).toISOString();
      case '30d':
        return subDays(now, 30).toISOString();
      case 'all':
      default:
        return null;
    }
  }, [timeRange]);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('cron_job_executions')
        .select('*');
      
      const timeRangeFilter = getTimeRangeFilter();
      if (timeRangeFilter) {
        query = query.gte('execution_time', timeRangeFilter);
      }
      
      const { data, error } = await query
        .order('execution_time', { ascending: false })
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      setJobs(data as CronJob[]);
      
      // Also fetch stats
      await fetchJobStats();
    } catch (error: any) {
      toast({
        title: 'Error fetching CRON jobs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [getTimeRangeFilter, toast]);

  const fetchJobStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_cron_job_stats', {
        time_range: timeRange === 'all' ? null : timeRange
      });
      
      if (error) {
        throw error;
      }
      
      setStats(data || []);
    } catch (error: any) {
      console.error('Error fetching job stats:', error);
    }
  }, [timeRange]);

  const runJob = useCallback(async (jobName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('triggerCronJob', {
        body: { job_name: jobName }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Job triggered',
        description: `Job "${jobName}" has been triggered manually`,
      });
      
      // Wait a moment and then refresh the jobs list
      setTimeout(fetchJobs, 2000);
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Error triggering job',
        description: error.message,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchJobs, toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, timeRange]);

  return {
    jobs,
    stats,
    loading,
    isLoading,
    timeRange,
    setTimeRange,
    fetchJobs,
    runJob,
  };
};
