
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifySuccess, notifyError } from '@/components/ui/BetterToast';

export interface CronJob {
  id: string;
  name: string;
  last_run: string | null;
  status: 'success' | 'failure' | 'running' | 'scheduled';
  next_run: string | null;
  duration_ms: number | null;
  created_at: string;
  error_message: string | null;
  metadata: Record<string, any> | null;
}

export interface CronJobStats {
  job_name: string;
  success_count: number;
  failure_count: number;
  avg_duration_ms: number;
  last_success: string | null;
  last_failure: string | null;
}

export type TimeRange = '24h' | '7d' | '30d' | '90d';

export const useCronJobsMonitoring = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<CronJobStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      // This would typically call a database function to get CRON job data
      // For now we'll mock the data since we don't have the actual database tables yet
      const mockJobs: CronJob[] = [
        {
          id: '1',
          name: 'update_kpis_daily',
          last_run: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          status: 'success',
          next_run: new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(),
          duration_ms: 2340,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          error_message: null,
          metadata: { rows_processed: 124, tenants_updated: 3 }
        },
        {
          id: '2',
          name: 'sync_mqls_weekly',
          last_run: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          status: 'success',
          next_run: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
          duration_ms: 5680,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          error_message: null,
          metadata: { leads_synced: 42 }
        },
        {
          id: '3',
          name: 'auto_evolve_agents_daily',
          last_run: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          status: 'failure',
          next_run: new Date(Date.now() + 1000 * 60 * 60 * 19).toISOString(),
          duration_ms: 3450,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
          error_message: 'OpenAI API rate limit exceeded',
          metadata: { agents_evaluated: 12, agents_evolved: 0 }
        },
        {
          id: '4',
          name: 'scheduled-intelligence-daily',
          last_run: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'success',
          next_run: new Date(Date.now() + 1000 * 60 * 60 * 23 + 1000 * 60 * 30).toISOString(),
          duration_ms: 8920,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
          error_message: null,
          metadata: { insights_generated: 8, strategies_updated: 3 }
        },
        {
          id: '5',
          name: 'cleanup_old_execution_logs',
          last_run: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          status: 'success',
          next_run: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
          duration_ms: 1230,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
          error_message: null,
          metadata: { logs_cleaned: 532, space_freed_kb: 1240 }
        }
      ];

      const mockStats: CronJobStats[] = [
        {
          job_name: 'update_kpis_daily',
          success_count: 28,
          failure_count: 2,
          avg_duration_ms: 2150,
          last_success: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          last_failure: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString()
        },
        {
          job_name: 'sync_mqls_weekly',
          success_count: 4,
          failure_count: 0,
          avg_duration_ms: 5320,
          last_success: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          last_failure: null
        },
        {
          job_name: 'auto_evolve_agents_daily',
          success_count: 24,
          failure_count: 6,
          avg_duration_ms: 3240,
          last_success: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          last_failure: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
        },
        {
          job_name: 'scheduled-intelligence-daily',
          success_count: 29,
          failure_count: 1,
          avg_duration_ms: 7840,
          last_success: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          last_failure: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
        },
        {
          job_name: 'cleanup_old_execution_logs',
          success_count: 30,
          failure_count: 0,
          avg_duration_ms: 1180,
          last_success: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          last_failure: null
        }
      ];

      setJobs(mockJobs);
      setStats(mockStats);
    } catch (error: any) {
      console.error('Error fetching CRON jobs:', error);
      notifyError('Error', 'Failed to fetch CRON jobs data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runJob = useCallback(async (jobName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('triggerCronJob', {
        body: { job_name: jobName }
      });

      if (error) {
        throw new Error(error.message || 'Failed to run job');
      }

      notifySuccess('Job Triggered', `The job "${jobName}" has been triggered successfully.`);
      
      // Refetch the jobs to get updated status
      setTimeout(fetchJobs, 2000);
      
      return { success: true, data };
    } catch (error: any) {
      console.error(`Error running job ${jobName}:`, error);
      notifyError('Error', `Failed to run job "${jobName}": ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, timeRange]);

  return {
    jobs,
    stats,
    isLoading,
    timeRange,
    setTimeRange,
    fetchJobs,
    runJob,
  };
};
