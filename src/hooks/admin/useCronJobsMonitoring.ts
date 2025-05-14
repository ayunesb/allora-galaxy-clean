
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  updated_at: string;
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
  
  const triggerJobNow = async (jobId: string) => {
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
    setSelectedJobId,
    setActiveTab,
    pauseJob,
    resumeJob,
    triggerJobNow,
    refreshJobs: fetchJobs,
  };
};

export default useCronJobsMonitoring;
