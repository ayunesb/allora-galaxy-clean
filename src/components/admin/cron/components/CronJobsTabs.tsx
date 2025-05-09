
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutionsTable } from './ExecutionsTable';
import { StatsTable } from './StatsTable';
import { ExecutionsTableSkeleton, StatsTableSkeleton } from './TableSkeletons';
import { CronJob } from '@/hooks/admin/useCronJobsMonitoring';

interface CronJobStats {
  job_name: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_ms: number | null;
  last_execution: string | null;
}

interface CronJobsTabsProps {
  jobs: CronJob[];
  stats: CronJobStats[];
  isLoading: boolean;
  onRunJob: (jobName: string) => Promise<any>;
}

export const CronJobsTabs: React.FC<CronJobsTabsProps> = ({ jobs, stats, isLoading, onRunJob }) => {
  return (
    <Tabs defaultValue="executions">
      <TabsList className="mb-4">
        <TabsTrigger value="executions">Executions</TabsTrigger>
        <TabsTrigger value="statistics">Statistics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="executions">
        {isLoading ? (
          <ExecutionsTableSkeleton />
        ) : jobs.length > 0 ? (
          <ExecutionsTable jobs={jobs} onRunJob={onRunJob} />
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
          <StatsTable stats={stats} onRunJob={onRunJob} />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No CRON job statistics available.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
