
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
  function_name: string;
  created_at: string;
}

interface CronJobExecution {
  id: string;
  job_id: string;
  status: 'success' | 'failed';
  executed_at: string;
  duration_ms: number;
  error: string | null;
  job_name?: string;
}

export const useCronJobsMonitoring = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [executions, setExecutions] = useState<CronJobExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [executionsLoading, setExecutionsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('day');
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    totalJobs: 0,
    enabledJobs: 0,
    disabledJobs: 0,
    successRate: 0,
    totalExecutionsToday: 0,
    failedExecutionsToday: 0,
    averageExecutionTime: 0,
  });
  
  // Calculate statistics
  const calculateStatistics = (jobsData: CronJob[], executionsData: CronJobExecution[]) => {
    // Count jobs
    const totalJobs = jobsData.length;
    const enabledJobs = jobsData.filter(job => job.enabled).length;
    const disabledJobs = totalJobs - enabledJobs;
    
    // Process executions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayExecutions = executionsData.filter(execution => {
      const executionDate = new Date(execution.executed_at);
      return executionDate >= today;
    });
    
    const totalExecutionsToday = todayExecutions.length;
    const failedExecutionsToday = todayExecutions.filter(exec => exec.status === 'failed').length;
    const successRate = totalExecutionsToday > 0 
      ? Math.round(((totalExecutionsToday - failedExecutionsToday) / totalExecutionsToday) * 100) 
      : 100;
    
    // Calculate average execution time
    const totalExecutionTime = executionsData.reduce((sum, execution) => sum + execution.duration_ms, 0);
    const averageExecutionTime = executionsData.length > 0 
      ? Math.round(totalExecutionTime / executionsData.length) 
      : 0;
    
    setStatistics({
      totalJobs,
      enabledJobs,
      disabledJobs,
      successRate,
      totalExecutionsToday,
      failedExecutionsToday,
      averageExecutionTime,
    });
  };

  // Fetch cron jobs
  const fetchCronJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cron_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setJobs(data);
      calculateStatistics(data, executions);
    } catch (error: any) {
      console.error('Error fetching cron jobs:', error);
      toast({ 
        description: `Error fetching cron jobs: ${error.message}`,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch cron job executions
  const fetchExecutions = async () => {
    setExecutionsLoading(true);
    try {
      // Define time range
      let startDate = new Date();
      
      switch (selectedTimeRange) {
        case 'hour':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 1); // Default to 1 day
      }
      
      const { data, error } = await supabase
        .from('cron_job_executions')
        .select('*, cron_jobs(name)')
        .gte('executed_at', startDate.toISOString())
        .order('executed_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include job_name
      const transformedData = data.map(item => ({
        ...item,
        job_name: item.cron_jobs?.name
      }));
      
      setExecutions(transformedData);
      calculateStatistics(jobs, transformedData);
    } catch (error: any) {
      console.error('Error fetching executions:', error);
      toast({ 
        description: `Error fetching job executions: ${error.message}`,
        variant: "destructive" 
      });
    } finally {
      setExecutionsLoading(false);
    }
  };

  // Trigger a cron job manually
  const triggerJob = async (jobId: string) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const { error } = await supabase.functions.invoke('triggerCronJob', {
        body: { jobId, functionName: job.function_name }
      });
      
      if (error) throw error;
      
      toast({ 
        description: `Job "${job.name}" triggered successfully`,
      });
      
      // Refresh data after a short delay to allow for execution
      setTimeout(() => {
        fetchExecutions();
      }, 3000);
      
    } catch (error: any) {
      console.error('Error triggering job:', error);
      toast({ 
        description: `Error triggering job: ${error.message}`,
        variant: "destructive" 
      });
    }
  };

  // Update job enabled status
  const toggleJobStatus = async (jobId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('cron_jobs')
        .update({ enabled })
        .eq('id', jobId);
      
      if (error) throw error;
      
      toast({ 
        description: `Job ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
      
      // Refresh job data
      fetchCronJobs();
      
    } catch (error: any) {
      console.error('Error updating job status:', error);
      toast({ 
        description: `Error updating job status: ${error.message}`,
        variant: "destructive" 
      });
    }
  };

  // Effect to load data on component mount and when time range changes
  useEffect(() => {
    fetchCronJobs();
    fetchExecutions();
  }, [selectedTimeRange]);

  return {
    jobs,
    executions,
    loading,
    executionsLoading,
    statistics,
    selectedTimeRange,
    setSelectedTimeRange,
    refreshJobs: fetchCronJobs,
    refreshExecutions: fetchExecutions,
    triggerJob,
    toggleJobStatus,
  };
};

export default useCronJobsMonitoring;
