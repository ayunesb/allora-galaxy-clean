
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export interface CronJob {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'failed';
  last_run: string | null;
  next_run: string | null;
  created_at: string;
  success_count: number;
  error_count: number;
  average_duration: number;
}

export interface CronJobExecution {
  id: string;
  cron_job_id: string;
  status: 'success' | 'failure';
  started_at: string;
  completed_at: string | null;
  duration: number;
  error: string | null;
  result: any;
}

export interface UseCronJobsMonitoringResult {
  cronJobs: CronJob[];
  executions: CronJobExecution[];
  selectedJob: CronJob | null;
  isLoading: boolean;
  error: Error | null;
  pauseJob: (id: string) => Promise<void>;
  resumeJob: (id: string) => Promise<void>;
  runNow: (id: string) => Promise<void>;
  selectJob: (job: CronJob | null) => void;
  refresh: () => Promise<void>;
}

export const useCronJobsMonitoring = (): UseCronJobsMonitoringResult => {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [executions, setExecutions] = useState<CronJobExecution[]>([]);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCronJobs = async () => {
    try {
      setIsLoading(true);
      
      // Normally you would fetch these from a Supabase table
      // For demo purposes, we'll return mock data
      const mockCronJobs: CronJob[] = [
        {
          id: '1',
          name: 'Update KPIs',
          status: 'active',
          last_run: new Date(Date.now() - 3600000).toISOString(),
          next_run: new Date(Date.now() + 3600000).toISOString(),
          created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
          success_count: 132,
          error_count: 3,
          average_duration: 2450
        },
        {
          id: '2',
          name: 'Auto-Evolve Agents',
          status: 'active',
          last_run: new Date(Date.now() - 7200000).toISOString(),
          next_run: new Date(Date.now() + 7200000).toISOString(),
          created_at: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
          success_count: 213,
          error_count: 7,
          average_duration: 5670
        },
        {
          id: '3',
          name: 'Sync MQLs',
          status: 'failed',
          last_run: new Date(Date.now() - 86400000).toISOString(),
          next_run: null,
          created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
          success_count: 89,
          error_count: 12,
          average_duration: 1890
        }
      ];
      
      setCronJobs(mockCronJobs);
      if (selectedJob) {
        const updatedSelectedJob = mockCronJobs.find(job => job.id === selectedJob.id);
        setSelectedJob(updatedSelectedJob || null);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Failed to fetch CRON jobs data'));
      toast({
        title: "Error",
        description: "Failed to fetch CRON jobs data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExecutions = async (jobId?: string) => {
    if (!selectedJob && !jobId) return;
    
    try {
      setIsLoading(true);
      
      // For demo purposes, returning mock data
      const mockExecutions: CronJobExecution[] = Array(10).fill(0).map((_, index) => ({
        id: `exec-${index}`,
        cron_job_id: selectedJob?.id || jobId || '',
        status: Math.random() > 0.2 ? 'success' : 'failure',
        started_at: new Date(Date.now() - (index * 86400000)).toISOString(),
        completed_at: Math.random() > 0.1 ? new Date(Date.now() - (index * 86400000) + 5000).toISOString() : null,
        duration: Math.floor(Math.random() * 10000),
        error: Math.random() > 0.8 ? 'Connection timeout' : null,
        result: { processed: Math.floor(Math.random() * 100) }
      }));
      
      setExecutions(mockExecutions);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch executions'));
      toast({
        title: "Error",
        description: err?.message || "Failed to fetch execution history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCronJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchExecutions(selectedJob.id);
    } else {
      setExecutions([]);
    }
  }, [selectedJob]);

  const pauseJob = async (id: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would update the job status in Supabase
      // For demo purposes, we'll just update the local state
      setCronJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === id 
            ? { ...job, status: 'paused' as const } 
            : job
        )
      );
      
      // Update selected job if it's the one being paused
      if (selectedJob?.id === id) {
        setSelectedJob(prev => prev ? { ...prev, status: 'paused' } : null);
      }
      
      toast({
        title: "Success",
        description: "CRON job paused successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to pause the CRON job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resumeJob = async (id: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would update the job status in Supabase
      setCronJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === id 
            ? { ...job, status: 'active' as const } 
            : job
        )
      );
      
      // Update selected job if it's the one being resumed
      if (selectedJob?.id === id) {
        setSelectedJob(prev => prev ? { ...prev, status: 'active' } : null);
      }
      
      toast({
        title: "Success",
        description: "CRON job resumed successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to resume the CRON job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runNow = async (id: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would trigger the job via Supabase Edge Function
      toast({
        title: "Success",
        description: "CRON job triggered successfully",
      });
      
      // Simulate new execution
      const newExecution: CronJobExecution = {
        id: `exec-new-${Date.now()}`,
        cron_job_id: id,
        status: 'success',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration: 1250,
        error: null,
        result: { processed: Math.floor(Math.random() * 100) }
      };
      
      setExecutions(prev => [newExecution, ...prev]);
      
      // Update job's last_run
      setCronJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === id 
            ? { ...job, last_run: new Date().toISOString() } 
            : job
        )
      );
      
      // Update selected job if it's the one being run
      if (selectedJob?.id === id) {
        setSelectedJob(prev => prev ? { ...prev, last_run: new Date().toISOString() } : null);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to trigger the CRON job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectJob = (job: CronJob | null) => {
    setSelectedJob(job);
    if (job) {
      fetchExecutions(job.id);
    }
  };

  const refresh = async () => {
    await fetchCronJobs();
    if (selectedJob) {
      await fetchExecutions(selectedJob.id);
    }
  };

  return {
    cronJobs,
    executions,
    selectedJob,
    isLoading,
    error,
    pauseJob,
    resumeJob,
    runNow,
    selectJob,
    refresh
  };
};
