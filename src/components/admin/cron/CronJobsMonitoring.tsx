
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCronJobsMonitoring } from '@/hooks/admin/useCronJobsMonitoring';
import CronJobsTabs from './components/CronJobsTabs';
import { ErrorState } from '@/components/ui/error-state';
import { CronJob } from '@/types/cron';

export const CronJobsMonitoring = () => {
  const { 
    isLoading, 
    jobs, 
    stats, 
    error, 
    fetchJobs 
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
            onRetry={fetchJobs}
            variant="destructive"
          />
        ) : (
          <CronJobsTabs 
            jobs={jobs as CronJob[]}
            stats={stats}
            isLoading={isLoading}
            onRunJob={fetchJobs}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CronJobsMonitoring;
