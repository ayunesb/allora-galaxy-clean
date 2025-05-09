
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCronJobsMonitoring } from '@/hooks/admin/useCronJobsMonitoring';
import { CronJobsHeader } from './components/CronJobsHeader';
import { CronJobsTabs } from './components/CronJobsTabs';

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
      <CronJobsHeader
        timeRange={timeRange}
        isLoading={isLoading}
        onTimeRangeChange={setTimeRange}
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
