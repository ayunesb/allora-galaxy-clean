import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define proper types for CronJob and related entities
interface CronJob {
  id: string;
  name: string;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  updated_at: string;
  error_message?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, any> | null;
}

interface CronExecution {
  id: string;
  job_id: string;
  start_time: string;
  end_time: string | null;
  status: 'success' | 'error' | 'running';
  error_message: string | null;
  result: any;
  created_at: string;
}

export interface CronJobStat {
  status: string;
  count: number;
}

export interface TimeRange {
  value: string;
  label: string;
}

// Fixed notification functions
function notifySuccess(message: string) {
  console.log('Success:', message);
}

function notifyError(message: string) {
  console.error('Error:', message);
}

export const useCronJobsMonitoring = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [executions, setExecutions] = useState<CronExecution[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all' | 'executions'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutionLoading, setIsExecutionLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<CronJobStat[]>([
    { status: 'success', count: 0 },
    { status: 'scheduled', count: 0 },
    { status: 'failure', count: 0 }
  ]);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    value: 'day',
    label: 'Last 24 hours'
  });
  
  // Fetch all cron jobs
  useEffect(() => {
    fetchJobs();
  }, []);
  
  // Fetch executions when a job is selected
  useEffect(() => {
    if (selectedJobId) {
      fetchExecutions(selectedJobId);
    }
  }, [selectedJobId]);
  
  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('cron_jobs')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setJobs(data);
      
      // Calculate statistics
      const newStats: CronJobStat[] = [
        { status: 'success', count: 0 },
        { status: 'scheduled', count: 0 },
        { status: 'failure', count: 0 }
      ];
      
      data.forEach((job: CronJob) => {
        if (job.status === 'active') {
          newStats.find(s => s.status === 'success')!.count++;
        } else if (job.status === 'inactive') {
          newStats.find(s => s.status === 'scheduled')!.count++;
        } else if (job.status === 'error') {
          newStats.find(s => s.status === 'failure')!.count++;
        }
      });
      
      setStats(newStats);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching cron jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchExecutions = async (jobId: string) => {
    setIsExecutionLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('cron_executions')
        .select('*')
        .eq('job_id', jobId)
        .order('start_time', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setExecutions(data);
    } catch (err) {
      console.error('Error fetching executions:', err);
    } finally {
      setIsExecutionLoading(false);
    }
  };
  
  const pauseJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('cron_jobs')
        .update({ status: 'inactive' })
        .eq('id', jobId);
      
      if (error) throw error;
      notifySuccess('Job paused successfully');
      fetchJobs();
    } catch (err) {
      notifyError('Failed to pause job');
      console.error('Error pausing job:', err);
    }
  };
  
  const resumeJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('cron_jobs')
        .update({ status: 'active' })
        .eq('id', jobId);
      
      if (error) throw error;
      notifySuccess('Job resumed successfully');
      fetchJobs();
    } catch (err) {
      notifyError('Failed to resume job');
      console.error('Error resuming job:', err);
    }
  };
  
  const runJob = async (jobId: string) => {
    try {
      // Directly call the edge function without extra arguments
      const { error } = await supabase.functions.invoke('triggerCronJob', {
        body: { jobId }
      });
      
      if (error) throw error;
      notifySuccess('Job triggered successfully');
    } catch (err) {
      notifyError('Failed to trigger job');
      console.error('Error triggering job:', err);
    }
  };
  
  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'active') return job.status === 'active';
    if (activeTab === 'inactive') return job.status === 'inactive' || job.status === 'error';
    return true; // 'all' tab
  });
  
  return {
    jobs: filteredJobs,
    executions,
    isLoading,
    isExecutionLoading,
    error,
    selectedJobId,
    activeTab,
    stats,
    timeRange,
    setTimeRange,
    setSelectedJobId,
    setActiveTab,
    pauseJob: async (jobId: string) => {
      try {
        const { error } = await supabase
          .from('cron_jobs')
          .update({ status: 'inactive' })
          .eq('id', jobId);
        
        if (error) throw error;
        notifySuccess('Job paused successfully');
        fetchJobs();
      } catch (err) {
        notifyError('Failed to pause job');
        console.error('Error pausing job:', err);
      }
    },
    resumeJob: async (jobId: string) => {
      try {
        const { error } = await supabase
          .from('cron_jobs')
          .update({ status: 'active' })
          .eq('id', jobId);
        
        if (error) throw error;
        notifySuccess('Job resumed successfully');
        fetchJobs();
      } catch (err) {
        notifyError('Failed to resume job');
        console.error('Error resuming job:', err);
      }
    },
    runJob: async (jobId: string) => {
      try {
        // Directly call the edge function without extra arguments
        const { error } = await supabase.functions.invoke('triggerCronJob', {
          body: { jobId }
        });
        
        if (error) throw error;
        notifySuccess('Job triggered successfully');
      } catch (err) {
        notifyError('Failed to trigger job');
        console.error('Error triggering job:', err);
      }
    },
    fetchJobs,
    refreshJobs: fetchJobs,
    triggerJobNow: runJob: async (jobId: string) => {
      try {
        // Directly call the edge function without extra arguments
        const { error } = await supabase.functions.invoke('triggerCronJob', {
          body: { jobId }
        });
        
        if (error) throw error;
        notifySuccess('Job triggered successfully');
      } catch (err) {
        notifyError('Failed to trigger job');
        console.error('Error triggering job:', err);
      }
    },
  };
};

export default useCronJobsMonitoring;
