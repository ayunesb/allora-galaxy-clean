
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  last_run: string;
  next_run: string;
  status: string;
  error_message: string | null;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  completed: number;
}

export function useCronJobsMonitoring() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    pending: 0,
    failed: 0,
    completed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API to get cron jobs
      // For demo purposes, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockJobs: CronJob[] = [
        {
          id: 'job-1',
          name: 'Sync KPIs',
          schedule: '0 * * * *', // Every hour
          last_run: new Date(Date.now() - 30 * 60000).toISOString(),
          next_run: new Date(Date.now() + 30 * 60000).toISOString(),
          status: 'completed',
          error_message: null
        },
        {
          id: 'job-2',
          name: 'Process MQLs',
          schedule: '0 0 * * *', // Daily at midnight
          last_run: new Date(Date.now() - 12 * 3600000).toISOString(),
          next_run: new Date(Date.now() + 12 * 3600000).toISOString(),
          status: 'pending',
          error_message: null
        },
        {
          id: 'job-3',
          name: 'Database Cleanup',
          schedule: '0 0 * * 0', // Weekly on Sunday
          last_run: new Date(Date.now() - 3 * 86400000).toISOString(),
          next_run: new Date(Date.now() + 4 * 86400000).toISOString(),
          status: 'failed',
          error_message: 'Connection timeout'
        },
        {
          id: 'job-4',
          name: 'Generate Reports',
          schedule: '0 9 * * 1-5', // Weekdays at 9am
          last_run: new Date(Date.now() - 18 * 3600000).toISOString(),
          next_run: new Date(Date.now() + 6 * 3600000).toISOString(),
          status: 'started',
          error_message: null
        }
      ];
      
      setJobs(mockJobs);
      
      // Calculate stats
      const total = mockJobs.length;
      const active = mockJobs.filter(job => job.status === 'started').length;
      const pending = mockJobs.filter(job => job.status === 'pending').length;
      const failed = mockJobs.filter(job => job.status === 'failed').length;
      const completed = mockJobs.filter(job => job.status === 'completed').length;
      
      setStats({
        total,
        active,
        pending,
        failed,
        completed
      });
      
    } catch (error: any) {
      console.error('Error fetching cron jobs:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch CRON jobs: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  const runJob = useCallback(async (jobId: string) => {
    try {
      // In a real app, this would call an API to run a cron job manually
      toast({
        title: 'Job initiated',
        description: `Manually running job ${jobId}`,
      });
      
      // Simulate job execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update job status in state
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'completed', last_run: new Date().toISOString() } 
          : job
      ));
      
      toast({
        title: 'Success',
        description: `Job ${jobId} completed successfully`,
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        active: Math.max(0, prev.active - 1),
        completed: prev.completed + 1
      }));
      
    } catch (error: any) {
      console.error('Error running job:', error);
      toast({
        title: 'Error',
        description: `Failed to run job: ${error.message}`,
        variant: 'destructive'
      });
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    stats,
    isLoading,
    timeRange,
    setTimeRange,
    fetchJobs,
    runJob
  };
}
