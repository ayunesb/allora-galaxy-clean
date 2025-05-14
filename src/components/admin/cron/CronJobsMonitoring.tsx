import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  status: 'active' | 'inactive' | 'running' | 'failed';
  last_status: 'success' | 'failed' | null;
  function_name: string;
  created_at: string;
}

const CronJobsMonitoring: React.FC = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchCronJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cron_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching cron jobs:', error);
      toast({
        title: 'Error fetching cron jobs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCronJobs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCronJobs();
    setRefreshing(false);
  };

  const handleRunNow = async (jobId: string) => {
    try {
      const { error } = await supabase.functions.invoke('trigger-cron-job', {
        body: { jobId },
      });

      if (error) throw error;

      toast({
        title: 'Job triggered',
        description: 'The job has been triggered manually',
      });

      // Refresh the list after a short delay
      setTimeout(() => fetchCronJobs(), 2000);
    } catch (error: any) {
      console.error('Error triggering job:', error);
      toast({
        title: 'Error triggering job',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Inactive</Badge>;
      case 'running':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Running</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLastStatusIcon = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cron Jobs</CardTitle>
          <CardDescription>Monitor and manage scheduled tasks</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <JobsTable 
              jobs={jobs} 
              loading={loading} 
              onRunNow={handleRunNow} 
              getStatusBadge={getStatusBadge}
              getLastStatusIcon={getLastStatusIcon}
            />
          </TabsContent>
          
          <TabsContent value="active">
            <JobsTable 
              jobs={jobs.filter(job => job.status === 'active')} 
              loading={loading} 
              onRunNow={handleRunNow} 
              getStatusBadge={getStatusBadge}
              getLastStatusIcon={getLastStatusIcon}
            />
          </TabsContent>
          
          <TabsContent value="failed">
            <JobsTable 
              jobs={jobs.filter(job => job.status === 'failed' || job.last_status === 'failed')} 
              loading={loading} 
              onRunNow={handleRunNow} 
              getStatusBadge={getStatusBadge}
              getLastStatusIcon={getLastStatusIcon}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface JobsTableProps {
  jobs: CronJob[];
  loading: boolean;
  onRunNow: (jobId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getLastStatusIcon: (status: string | null) => React.ReactNode;
}

const JobsTable: React.FC<JobsTableProps> = ({ 
  jobs, 
  loading, 
  onRunNow, 
  getStatusBadge,
  getLastStatusIcon 
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No jobs found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{job.name}</span>
                  <span className="text-xs text-muted-foreground">{job.function_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{job.schedule}</code>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  {job.last_status && (
                    <span title={`Last run: ${job.last_status}`}>
                      {getLastStatusIcon(job.last_status)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {job.last_run ? (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span title={format(new Date(job.last_run), 'PPpp')}>
                      {formatDistanceToNow(new Date(job.last_run), { addSuffix: true })}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Never</span>
                )}
              </TableCell>
              <TableCell>
                {job.next_run ? (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span title={format(new Date(job.next_run), 'PPpp')}>
                      {formatDistanceToNow(new Date(job.next_run), { addSuffix: true })}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Not scheduled</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRunNow(job.id)}
                  disabled={job.status === 'running'}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run Now
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CronJobsMonitoring;
