
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle, PlayCircle } from 'lucide-react';

type CronJob = {
  job_name: string;
  executions: number;
  successful: number;
  failed: number;
  avg_duration_ms: number;
  last_execution: string;
  last_status: string;
};

const CronJobsMonitoring: React.FC = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoadingRefresh(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('get_cron_job_stats');
      
      if (error) {
        throw new Error(`Failed to fetch CRON jobs: ${error.message}`);
      }
      
      setJobs(data || []);
    } catch (err: any) {
      console.error('Error fetching CRON jobs:', err);
      setError(err.message || 'Failed to fetch CRON jobs');
      
      toast({
        title: 'Error fetching CRON jobs',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const triggerJob = async (jobName: string) => {
    setTriggering(jobName);
    
    try {
      const { data, error } = await supabase.functions.invoke('triggerCronJob', {
        body: { job_name: jobName }
      });
      
      if (error) {
        throw new Error(`Failed to trigger job: ${error.message}`);
      }
      
      toast({
        title: 'Job Triggered',
        description: `${jobName} has been triggered successfully`,
        variant: 'default'
      });
      
      // Refresh job list after a delay to see the new execution
      setTimeout(() => fetchJobs(), 2000);
    } catch (err: any) {
      console.error('Error triggering job:', err);
      
      toast({
        title: 'Failed to Trigger Job',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setTriggering(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Completed</Badge>;
    } else if (status === 'failed') {
      return <Badge variant="destructive"><AlertCircle className="w-4 h-4 mr-1" /> Failed</Badge>;
    } else if (status === 'running') {
      return <Badge variant="secondary"><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Running</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '-';
    
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      return `${(ms / 60000).toFixed(2)}m`;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2">Loading CRON jobs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h3 className="mt-2 text-lg font-medium">Failed to load CRON jobs</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button onClick={fetchJobs} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Scheduled Jobs</CardTitle>
            <CardDescription>Monitor and manage CRON jobs</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchJobs}
            disabled={loadingRefresh}
          >
            {loadingRefresh ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No CRON jobs found</p>
          </div>
        ) : (
          <Table>
            <TableCaption>List of scheduled CRON jobs and their execution status</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Success/Total</TableHead>
                <TableHead className="text-right">Avg Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.job_name}>
                  <TableCell className="font-medium">{job.job_name}</TableCell>
                  <TableCell>{formatDate(job.last_execution)}</TableCell>
                  <TableCell>{getStatusBadge(job.last_status)}</TableCell>
                  <TableCell className="text-center">
                    {job.successful}/{job.executions}
                  </TableCell>
                  <TableCell className="text-right">{formatDuration(job.avg_duration_ms)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => triggerJob(job.job_name)}
                      disabled={triggering === job.job_name}
                    >
                      {triggering === job.job_name ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Run Now
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Jobs are executed on schedule by the Supabase pg_cron extension. You can also trigger them manually.
        </p>
      </CardFooter>
    </Card>
  );
};

export default CronJobsMonitoring;
