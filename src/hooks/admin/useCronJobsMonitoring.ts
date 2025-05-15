
import { useState, useEffect } from 'react';
import { CronJob, CronExecution, CronJobStat, TimeRange } from '@/types/admin/cronJobs';
import * as cronJobsService from '@/services/admin/cronJobsService';
import { calculateJobStats, filterJobsByTab } from '@/lib/admin/cronStatsHelper';

export const useCronJobsMonitoring = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [executions, setExecutions] = useState<CronExecution[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all' | 'executions'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutionLoading, setIsExecutionLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<CronJobStat[]>([
    { status: 'success', count: 0 },
    { status: 'scheduled', count: 0 },
    { status: 'failure', count: 0 }
  ]);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    value: 'day',
    label: 'Last 24 hours'
  });
  
  // Fetch all cron jobs
  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await cronJobsService.fetchJobs();
    
    if (error) {
      setError(error);
    } else if (data) {
      setJobs(data);
      setStats(calculateJobStats(data));
    }
    
    setIsLoading(false);
  };
  
  // Fetch executions when a job is selected
  const fetchExecutions = async (jobId: string) => {
    setIsExecutionLoading(true);
    
    const { data } = await cronJobsService.fetchExecutions(jobId);
    
    if (data) {
      setExecutions(data);
    }
    
    setIsExecutionLoading(false);
  };
  
  // Fetch all cron jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);
  
  // Fetch executions when a job is selected
  useEffect(() => {
    if (selectedJobId) {
      fetchExecutions(selectedJobId);
    }
  }, [selectedJobId]);
  
  const filteredJobs = filterJobsByTab(jobs, activeTab);
  
  return {
    jobs: filteredJobs,
    executions,
    isLoading,
    isExecutionLoading,
    error,
    selectedJobId,
    activeTab,
    stats,
    timeRange,
    setTimeRange,
    setSelectedJobId,
    setActiveTab,
    pauseJob: cronJobsService.pauseJob,
    resumeJob: cronJobsService.resumeJob,
    runJob: cronJobsService.runJob,
    fetchJobs,
    refreshJobs: fetchJobs,
    triggerJobNow: cronJobsService.runJob
  };
};

export default useCronJobsMonitoring;
