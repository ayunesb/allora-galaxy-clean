
import React, { useState } from 'react';
import useCronJobsMonitoring, { TimeRange } from '@/hooks/admin/useCronJobsMonitoring';
import { CronJobsHeader } from './components/CronJobsHeader';
import { CronJobsTabs } from './components/CronJobsTabs';
import { StatusBadge } from './components/StatusBadge';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

export function CronJobsMonitoring() {
  const [activeTab, setActiveTab] = useState<string>('jobs');
  
  const {
    jobs,
    stats,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    fetchJobs,
    runJob
  } = useCronJobsMonitoring();
  
  const handleRefresh = async () => {
    try {
      await fetchJobs();
      toast.success('Data refreshed successfully');
    } catch (err) {
      toast.error('Failed to refresh data');
    }
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  const handleRunJob = async (jobId: string, jobName: string) => {
    try {
      await runJob(jobId);
      toast.success(`Job "${jobName}" triggered successfully`);
    } catch (err) {
      toast.error(`Failed to trigger job "${jobName}"`);
    }
  };
  
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
        <h3 className="font-medium">Error loading cron jobs</h3>
        <p className="text-sm mt-1">{error.message}</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 text-sm bg-muted px-3 py-1 rounded-md hover:bg-muted/80"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Loading cron jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CronJobsHeader 
        onRefresh={handleRefresh} 
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />
      
      <CronJobsTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        jobs={jobs}
        stats={stats}
        onRunJob={handleRunJob}
      />
    </div>
  );
}

export default CronJobsMonitoring;
