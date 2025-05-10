
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCronJobsMonitoring } from '@/hooks/admin/useCronJobsMonitoring';
import { CronJobsHeader } from './components/CronJobsHeader';
import { CronJobsTabs } from './components/CronJobsTabs';

// Define the correct interfaces for the component
export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  status: 'active' | 'inactive' | 'running' | 'failed';
  function_name: string;
  created_at: string;
  error_message?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, any> | null;
}

export interface CronJobStats {
  status: string;
  count: number;
}

interface TimeRange {
  value: string;
  label: string;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  completed: number;
}

const CronJobsMonitoring: React.FC = () => {
  const { 
    jobs: cronJobData, 
    stats: cronJobStats, 
    isLoading, 
    timeRange, 
    setTimeRange, 
    fetchJobs: refreshData, 
    runJob: runCronJob 
  } = useCronJobsMonitoring();

  // Map the jobData to the expected CronJob type
  const jobs: CronJob[] = cronJobData.map(job => ({
    id: job.id,
    name: job.name,
    schedule: job.schedule || '* * * * *', // Provide default schedule if not available
    last_run: job.last_run,
    next_run: job.next_run,
    status: mapStatus(job.status),
    function_name: job.name, // Using name as function_name
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
  const stats: Stats = {
    total: cronJobStats.reduce((sum, stat) => sum + stat.count, 0),
    active: cronJobStats.find(s => s.status === 'success')?.count || 0,
    pending: cronJobStats.find(s => s.status === 'scheduled')?.count || 0,
    failed: cronJobStats.find(s => s.status === 'failure')?.count || 0,
    completed: cronJobStats.find(s => s.status === 'success')?.count || 0
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange((prevState: TimeRange) => ({
      ...prevState,
      value,
      label: value === 'day' ? 'Last 24 hours' : 
             value === 'week' ? 'Last 7 days' : 
             value === 'month' ? 'Last 30 days' : 'All time'
    }));
  };

  return (
    <Card>
      <CronJobsHeader
        timeRange={timeRange.value}
        isLoading={isLoading}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={refreshData}
      />
      <CardContent>
        <CronJobsTabs
          jobs={jobs}
          stats={stats}
          isLoading={isLoading}
          onRunJob={runCronJob}
        />
      </CardContent>
    </Card>
  );
};

export default CronJobsMonitoring;
