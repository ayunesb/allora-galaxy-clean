
import React from 'react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play } from 'lucide-react';
import { useCronJobsMonitoring } from '@/hooks/admin/useCronJobsMonitoring';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

const CronJobsMonitoring: React.FC = () => {
  const {
    jobs,
    stats,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    refreshData,
    runCronJob
  } = useCronJobsMonitoring();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPp");
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return 'N/A';
    
    if (ms < 1000) {
      return `${ms.toFixed(2)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'started':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CRON Jobs Monitoring</h1>
        <div className="flex space-x-4 items-center">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-[180px]">
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
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Monitor and manage scheduled CRON jobs execution and performance.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
          Error: {error}
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.job_name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{stat.job_name}</CardTitle>
              <CardDescription>
                {stat.total_executions} total executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm text-muted-foreground">Success rate:</span>
                  <span className="text-sm font-medium">
                    {stat.total_executions > 0
                      ? `${((stat.successful_executions / stat.total_executions) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm text-muted-foreground">Avg. duration:</span>
                  <span className="text-sm font-medium">
                    {formatDuration(stat.avg_duration_ms)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm text-muted-foreground">Last run:</span>
                  <span className="text-sm font-medium">
                    {stat.last_execution 
                      ? formatDate(stat.last_execution)
                      : 'Never'}
                  </span>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => runCronJob(stat.job_name)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Run Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            Recent executions of scheduled CRON jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Execution Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.job_name}</TableCell>
                      <TableCell>{formatDate(job.execution_time)}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{formatDuration(job.duration_ms)}</TableCell>
                      <TableCell>
                        {job.error_message ? (
                          <span className="text-red-600 line-clamp-1" title={job.error_message}>
                            {job.error_message}
                          </span>
                        ) : job.status === 'completed' ? (
                          <span className="text-green-600">None</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No job execution history found for the selected time range.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleCheck(CronJobsMonitoring, { roles: ['admin', 'owner'] });
