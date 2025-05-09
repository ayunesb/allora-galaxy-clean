
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { useTenantId } from '@/hooks/useTenantId';

export type CronJob = {
  id: string;
  job_name: string;
  execution_time: string;
  status: 'started' | 'completed' | 'failed';
  duration_ms: number | null;
  error_message: string | null;
  metadata: Record<string, any> | null;
};

export type CronJobStats = {
  job_name: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_ms: number | null;
  last_successful_execution: string | null;
  last_execution: string | null;
};

export function useCronJobsMonitoring() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<CronJobStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const tenantId = useTenantId();

  const fetchCronJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare time filter based on selected range
      let timeFilter = '';
      const now = new Date();
      
      if (timeRange === '24h') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        timeFilter = `execution_time.gte.${yesterday.toISOString()}`;
      } else if (timeRange === '7d') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        timeFilter = `execution_time.gte.${weekAgo.toISOString()}`;
      } else if (timeRange === '30d') {
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        timeFilter = `execution_time.gte.${monthAgo.toISOString()}`;
      }
      
      // Query for job execution history
      let query = supabase
        .from('cron_job_history')
        .select('*')
        .order('execution_time', { ascending: false });
        
      // Apply time filter if specified
      if (timeFilter) {
        query = query.filter(timeFilter);
      }
        
      const { data: jobsData, error: jobsError } = await query;
      
      if (jobsError) throw jobsError;
      
      setJobs(jobsData || []);
      
      // Query for job statistics
      const { data: statsData, error: statsError } = await supabase
        .from('cron_job_stats')
        .select('*');
        
      if (statsError) throw statsError;
      
      setStats(statsData || []);
    } catch (e: any) {
      console.error('Error fetching CRON jobs data:', e);
      setError(e.message || 'Failed to fetch CRON jobs data');
      toast.error("Failed to load CRON jobs monitoring data");
    } finally {
      setIsLoading(false);
    }
  };

  // Run a CRON job manually
  const runCronJob = async (jobName: string) => {
    try {
      // Log the manual execution - Fix parameter count by passing module, event, context, tenantId
      await logSystemEvent(
        'system',               // module
        'manual_cron_job_trigger', // event
        { job_name: jobName },     // context
        tenantId                // tenantId
      );
      
      // Call the edge function to manually trigger a CRON job
      const { data, error } = await supabase.functions.invoke('triggerCronJob', {
        body: { job_name: jobName }
      });
      
      if (error) throw error;
      
      toast.success(`CRON job ${jobName} triggered successfully`);
      
      // Refresh the data after a short delay to show the new execution
      setTimeout(fetchCronJobs, 2000);
      return data;
    } catch (e: any) {
      console.error('Error triggering CRON job:', e);
      toast.error(e.message || "Failed to trigger CRON job");
      return null;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCronJobs();
  }, [timeRange]);

  return {
    jobs,
    stats,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    refreshData: fetchCronJobs,
    runCronJob
  };
}

export default useCronJobsMonitoring;
