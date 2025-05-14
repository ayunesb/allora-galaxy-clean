
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RefreshCw, Trash2 } from 'lucide-react';

type CronJob = {
  id: string;
  name: string;
  schedule: string;
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
};

export function CronJobsMonitoring() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Fetch cron jobs
  const { data: cronJobs, isLoading, error } = useQuery({
    queryKey: ['cron-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_jobs')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as CronJob[];
    }
  });

  // Run job manually
  const runJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.functions.invoke('run-cron-job', {
        body: { job_id: jobId }
      });
      
      if (error) throw error;
      return jobId;
    },
    onSuccess: (jobId) => {
      toast.success('Job triggered', {
        description: 'The job has been triggered and will run shortly.'
      });
      queryClient.invalidateQueries({ queryKey: ['cron-jobs'] });
    },
    onError: (error: any) => {
      toast.error('Failed to trigger job', {
        description: error.message || 'An unexpected error occurred'
      });
    }
  });

  // Toggle job active state
  const toggleJobMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('cron_jobs')
        .update({ is_active: isActive })
        .eq('id', jobId);
        
      if (error) throw error;
      return { jobId, isActive };
    },
    onSuccess: ({ jobId, isActive }) => {
      toast.success(`Job ${isActive ? 'enabled' : 'disabled'}`, {
        description: `The job has been ${isActive ? 'enabled' : 'disabled'} successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['cron-jobs'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update job status', {
        description: error.message || 'An unexpected error occurred'
      });
    }
  });

  // Delete job
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('cron_jobs')
        .delete()
        .eq('id', jobId);
        
      if (error) throw error;
      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cron-jobs'] });
    }
  });

  if (isLoading) {
    return <div className="py-10 text-center">Loading cron jobs...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-destructive mb-4">Failed to load cron jobs</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['cron-jobs'] })}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <div className="bg-muted/50 p-4">
          <h3 className="font-medium">Scheduled Jobs</h3>
        </div>
        <div className="divide-y">
          {cronJobs && cronJobs.length > 0 ? (
            cronJobs.map((job) => (
              <div 
                key={job.id} 
                className="flex items-center justify-between px-4 py-3 hover:bg-accent/50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{job.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{job.schedule}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.last_run ? `Last run: ${new Date(job.last_run).toLocaleString()}` : 'Never run'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={job.is_active}
                    onCheckedChange={(checked) => 
                      toggleJobMutation.mutate({ jobId: job.id, isActive: checked })
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runJobMutation.mutate(job.id)}
                    disabled={runJobMutation.isPending && selectedJob === job.id}
                    className="flex items-center gap-1"
                  >
                    {runJobMutation.isPending && selectedJob === job.id ? (
                      <>Working...</>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        Run Now
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this job?')) {
                        deleteJobMutation.mutate(job.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No cron jobs configured. Add one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
