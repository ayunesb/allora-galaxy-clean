
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCronJobsMonitoring, CronJob, CronJobStat } from '@/hooks/admin/useCronJobsMonitoring';
import { CronJobsHeader } from './components/CronJobsHeader';
import { CronJobsTabs, CronJob as TabsCronJob, CronJobStats } from './components/CronJobsTabs';

const CronJobsMonitoring: React.FC = () => {
  const { 
    jobs, 
    stats, 
    isLoading, 
    timeRange, 
    setTimeRange, 
    fetchJobs,
    runJob
  } = useCronJobsMonitoring();

  // Map the jobData to the expected CronJob type that matches CronJobsTabs interface
  const mappedJobs: TabsCronJob[] = jobs.map(job => ({
    id: job.id,
    name: job.name,
    schedule: job.schedule,
    last_run: job.last_run,
    next_run: job.next_run,
    status: mapStatus(job.status),
    function_name: job.name,
    created_at: job.created_at,
    error_message: job.error_message,
    duration_ms: job.duration_ms,
    metadata: job.metadata
  }));

  // Map status from API to our component's expected values
  function mapStatus(status: string): 'active' | 'inactive' | 'running' | 'failed' {
    switch (status) {
      case 'success': return 'active';
      case 'running': return 'running';
      case 'failure': return 'failed';
      case 'scheduled': return 'inactive';
      default: return 'inactive';
    }
  }

  // Create a Stats object from cronJobStats
  const jobStats: CronJobStats = {
    total: stats.reduce((sum: number, stat: CronJobStat) => sum + stat.count, 0),
    active: stats.find((s: CronJobStat) => s.status === 'success')?.count || 0,
    pending: stats.find((s: CronJobStat) => s.status === 'scheduled')?.count || 0,
    failed: stats.find((s: CronJobStat) => s.status === 'failure')?.count || 0,
    completed: stats.find((s: CronJobStat) => s.status === 'success')?.count || 0
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange({
      value,
      label: value === 'day' ? 'Last 24 hours' : 
             value === 'week' ? 'Last 7 days' : 
             value === 'month' ? 'Last 30 days' : 'All time'
    });
  };

  return (
    <Card>
      <CronJobsHeader
        timeRange={timeRange.value}
        isLoading={isLoading}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={fetchJobs}
      />
      <CardContent>
        <CronJobsTabs
          jobs={mappedJobs}
          stats={jobStats}
          isLoading={isLoading}
          onRunJob={runJob}
        />
      </CardContent>
    </Card>
  );
};

export default CronJobsMonitoring;
