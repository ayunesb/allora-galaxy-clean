
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ExecutionsTable, CronJobExecution } from './ExecutionsTable';
import { StatsTable, CronJobStats } from './StatsTable';
import { Button } from '@/components/ui/button';

interface CronJobsTabsProps {
  jobs: CronJobExecution[];
  stats: CronJobStats;
  isLoading: boolean;
  onRunJob?: (jobName: string) => Promise<any>;
}

export const CronJobsTabs: React.FC<CronJobsTabsProps> = ({ 
  jobs, 
  stats, 
  isLoading,
  onRunJob 
}) => {
  const [activeTab, setActiveTab] = useState("executions");

  const handleRunJob = async (jobName: string) => {
    if (onRunJob) {
      await onRunJob(jobName);
    }
  };

  return (
    <Tabs defaultValue="executions" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="executions">Executions</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="executions">
        <Card>
          <CardContent className="p-0 sm:p-6">
            <ExecutionsTable 
              jobs={jobs} 
              isLoading={isLoading}
              actionButton={(job: CronJobExecution) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRunJob(job.name)}
                  disabled={isLoading || job.status === 'running'}
                >
                  {job.status === 'running' ? 'Running...' : 'Run Now'}
                </Button>
              )}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="stats">
        <Card>
          <CardContent className="p-0 sm:p-6">
            <StatsTable stats={stats} isLoading={isLoading} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export type { CronJobExecution as CronJob };
export type { CronJobStats };
export default CronJobsTabs;
