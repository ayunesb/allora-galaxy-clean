import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, AlertTriangle, CheckCircle, Clock, RotateCw } from 'lucide-react';
import { format } from 'date-fns';
import { useCronJobsMonitoring, CronJob } from '@/hooks/admin/useCronJobsMonitoring';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CronJobsMonitoring: React.FC = () => {
  const { 
    jobs, 
    stats, 
    isLoading, 
    timeRange, 
    setTimeRange, 
    fetchJobs: refreshData, 
    runJob: runCronJob 
  } = useCronJobsMonitoring();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>CRON Jobs Monitoring</CardTitle>
          <CardDescription>Monitor and manage scheduled background tasks</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={(value: '24h' | '7d' | '30d' | 'all') => setTimeRange(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RotateCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="executions">
          <TabsList className="mb-4">
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="executions">
            {isLoading ? (
              <ExecutionsTableSkeleton />
            ) : jobs.length > 0 ? (
              <ExecutionsTable jobs={jobs} onRunJob={runCronJob} />
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No CRON job executions found in the selected time period.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="statistics">
            {isLoading ? (
              <StatsTableSkeleton />
            ) : stats && stats.length > 0 ? (
              <StatsTable stats={stats} onRunJob={runCronJob} />
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No CRON job statistics available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ExecutionsTableProps { 
  jobs: CronJob[]; 
  onRunJob: (jobName: string) => Promise<any>; 
}

const ExecutionsTable: React.FC<ExecutionsTableProps> = ({ jobs, onRunJob }) => (
  <div className="rounded-md border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Execution Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.job_name}</TableCell>
            <TableCell>
              <StatusBadge status={job.status} errorMessage={job.error_message} />
            </TableCell>
            <TableCell>{format(new Date(job.execution_time), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
            <TableCell>
              {job.duration_ms ? `${(job.duration_ms / 1000).toFixed(2)}s` : 'In progress'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRunJob(job.job_name)}
                title="Run job now"
              >
                <PlayCircle className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

interface CronJobStats {
  job_name: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_ms: number | null;
  last_execution: string | null;
}

interface StatsTableProps { 
  stats: CronJobStats[]; 
  onRunJob: (jobName: string) => Promise<any>; 
}

const StatsTable: React.FC<StatsTableProps> = ({ stats, onRunJob }) => (
  <div className="rounded-md border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Name</TableHead>
          <TableHead>Total Executions</TableHead>
          <TableHead>Success Rate</TableHead>
          <TableHead>Avg Duration</TableHead>
          <TableHead>Last Execution</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map((stat) => (
          <TableRow key={stat.job_name}>
            <TableCell className="font-medium">{stat.job_name}</TableCell>
            <TableCell>{stat.total_executions}</TableCell>
            <TableCell>
              {stat.total_executions > 0 ? (
                `${Math.round((stat.successful_executions / stat.total_executions) * 100)}%`
              ) : 'N/A'}
            </TableCell>
            <TableCell>
              {stat.avg_duration_ms ? `${(stat.avg_duration_ms / 1000).toFixed(2)}s` : 'N/A'}
            </TableCell>
            <TableCell>
              {stat.last_execution ? format(new Date(stat.last_execution), 'yyyy-MM-dd HH:mm:ss') : 'Never'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRunJob(stat.job_name)}
                title="Run job now"
              >
                <PlayCircle className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

interface StatusBadgeProps { 
  status: string; 
  errorMessage: string | null; 
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, errorMessage }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case 'started':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Running
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200" title={errorMessage || undefined}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const ExecutionsTableSkeleton = () => (
  <div className="rounded-md border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Execution Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array(5).fill(0).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const StatsTableSkeleton = () => (
  <div className="rounded-md border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Name</TableHead>
          <TableHead>Total Executions</TableHead>
          <TableHead>Success Rate</TableHead>
          <TableHead>Avg Duration</TableHead>
          <TableHead>Last Execution</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array(4).fill(0).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default CronJobsMonitoring;
