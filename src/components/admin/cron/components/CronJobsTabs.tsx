
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ExecutionsTable } from './ExecutionsTable';
import { StatsTable } from './StatsTable';
import { Button } from '@/components/ui/button';
import { CronJob, CronJobStat, CronJobStats } from '@/types/cron';

interface CronJobsTabsProps {
  jobs: CronJob[];
  stats: CronJobStat[];
  isLoading: boolean;
  onRunJob?: (jobId: string) => Promise<any>;
}

export const CronJobsTabs: React.FC<CronJobsTabsProps> = ({ 
  jobs, 
  stats, 
  isLoading,
  onRunJob 
}) => {
  const [activeTab, setActiveTab] = useState("executions");

  // Convert the stats array to a CronJobStats object format expected by StatsTable
  const statsObject: CronJobStats = {
    total: stats.reduce((sum, stat) => sum + stat.count, 0),
    active: stats.find(s => s.status === 'active')?.count || 0,
    pending: stats.find(s => s.status === 'scheduled')?.count || 0,
    failed: stats.find(s => s.status === 'failed')?.count || 0,
    completed: stats.find(s => s.status === 'completed')?.count || 0
  };

  const handleRunJob = async (jobId: string) => {
    if (onRunJob) {
      await onRunJob(jobId);
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
              actionButton={(job: CronJob) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRunJob(job.id)}
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
            <StatsTable stats={statsObject} rawStats={stats} isLoading={isLoading} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CronJobsTabs;
