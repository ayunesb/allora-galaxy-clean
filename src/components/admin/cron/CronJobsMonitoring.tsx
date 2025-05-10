
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCronJobsMonitoring } from '@/hooks/admin/useCronJobsMonitoring';
import { CronJobsHeader } from './components/CronJobsHeader';
import { CronJobsTabs } from './components/CronJobsTabs';

interface TimeRange {
  value: string;
  label: string;
}

// Define the types for CronJob and Stats to match the expected interface
interface CronJob {
  id: string;
  name: string;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  status: 'active' | 'inactive' | 'running' | 'failed';
  function_name: string;
  created_at: string;
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
    jobs: cronJobs, 
    stats: cronStats, 
    isLoading, 
    timeRange, 
    setTimeRange, 
    fetchJobs: refreshData, 
    runJob: runCronJob 
  } = useCronJobsMonitoring();

  // Map the jobData to the expected CronJob type
  const jobs: CronJob[] = cronJobs.map(job => ({
    ...job,
    schedule: job.schedule || '* * * * *' // Provide default schedule if not available
  }));

  // Create a Stats object from cronStats
  const stats: Stats = {
    total: cronStats.reduce((sum, stat) => sum + stat.count, 0),
    active: cronStats.find(s => s.status === 'active')?.count || 0,
    pending: cronStats.find(s => s.status === 'pending')?.count || 0,
    failed: cronStats.find(s => s.status === 'failed')?.count || 0,
    completed: cronStats.find(s => s.status === 'completed')?.count || 0
  };

  const handleTimeRangeChange = (value: string) => {
    const selectedTimeRange = {
      value,
      label: value === 'day' ? 'Last 24 hours' : 
             value === 'week' ? 'Last 7 days' : 
             value === 'month' ? 'Last 30 days' : 'All time'
    };
    setTimeRange(selectedTimeRange);
  };

  return (
    <Card>
      <CronJobsHeader
        timeRange={timeRange}
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
