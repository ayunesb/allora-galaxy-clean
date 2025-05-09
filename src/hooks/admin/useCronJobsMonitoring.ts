import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CronJob {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  schedule: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body: any;
  is_enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  error_count: number;
  success_count: number;
  description: string | null;
}

export const useCronJobsMonitoring = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cron_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to fetch jobs: ${error.message}`,
          variant: "destructive"
        });
      } else {
        setJobs(data || []);
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
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

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

  // Fix other toast calls in the file
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
        user_id: supabase.auth.currentUser?.id || null,
      },
    ]);
  };

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    toggleJobStatus,
    runJob,
    logSystemEvent,
  };
};
