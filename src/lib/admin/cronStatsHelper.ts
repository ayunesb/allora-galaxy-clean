
import { CronJob, CronJobStat } from '@/types/admin/cronJobs';

/**
 * Calculate stats for CRON jobs
 * @param jobs Array of cron jobs
 * @returns Stats object with counts
 */
export function calculateJobStats(jobs: CronJob[]): CronJobStat[] {
  // Calculate stats from current jobs
  const stats: Record<string, number> = {
    success: 0,
    scheduled: 0,
    failure: 0
  };

  if (!jobs || jobs.length === 0) {
    return Object.entries(stats).map(([status, count]) => ({ status, count }));
  }

  // Count jobs by status
  jobs.forEach(job => {
    switch (job.status) {
      case 'success':
        stats.success++;
        break;
      case 'active':
      case 'scheduled':
        stats.scheduled++;
        break;
      case 'failure':
      case 'error':
        stats.failure++;
        break;
      default:
        // Add to scheduled by default
        stats.scheduled++;
    }
  });

  // Convert to array format
  return Object.entries(stats).map(([status, count]) => ({
    status,
    count
  }));
}

/**
 * Filter jobs by tab selection
 * @param jobs Array of CRON jobs
 * @param tab Active tab selection
 * @returns Filtered jobs
 */
export function filterJobsByTab(
  jobs: CronJob[], 
  tab: 'active' | 'inactive' | 'all' | 'executions'
): CronJob[] {
  if (tab === 'all') {
    return jobs;
  }

  if (tab === 'active') {
    return jobs.filter(job => job.status === 'active' || job.status === 'success' || job.status === 'running');
  }

  if (tab === 'inactive') {
    return jobs.filter(job => job.status === 'inactive' || job.status === 'error' || job.status === 'failure');
  }

  return jobs;
}

/**
 * Filter jobs by time range
 * @param jobs Array of CRON jobs
 * @param timeRange Time range value
 * @returns Filtered jobs
 */
export function filterJobsByTimeRange(jobs: CronJob[], timeRange: string): CronJob[] {
  if (!timeRange || timeRange === 'all') {
    return jobs;
  }

  const now = new Date();
  let cutoffDate: Date;

  switch (timeRange) {
    case 'day':
      cutoffDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      cutoffDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      cutoffDate = new Date(now.setDate(now.getDate() - 30));
      break;
    default:
      return jobs;
  }

  return jobs.filter(job => {
    const lastRunDate = job.last_run ? new Date(job.last_run) : null;
    return lastRunDate && lastRunDate >= cutoffDate;
  });
}
