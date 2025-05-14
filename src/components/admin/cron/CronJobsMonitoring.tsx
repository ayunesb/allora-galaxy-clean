
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCronJobsMonitoring } from '@/hooks/admin/useCronJobsMonitoring';
import CronJobsTabs from './components/CronJobsTabs';
import { ErrorState } from '@/components/ui/error-state';

export const CronJobsMonitoring = () => {
  const { 
    isLoading, 
    jobs, 
    executions, 
    error, 
    refresh 
  } = useCronJobsMonitoring();
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>CRON Jobs Monitoring</CardTitle>
        <CardDescription>
          View and manage scheduled tasks across the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorState
            title="Failed to load CRON jobs"
            message={error.message}
            retryable
            onRetry={refresh}
            variant="destructive"
          />
        ) : (
          <CronJobsTabs 
            jobs={jobs}
            executions={executions}
            isLoading={isLoading}
            onRefresh={refresh}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CronJobsMonitoring;
