
import { CronJob, CronJobStat } from '@/types/admin/cronJobs';

/**
 * Calculate job statistics from cron job data
 * @param jobs Array of cron jobs
 * @returns Array of statistics about job statuses
 */
export function calculateJobStats(jobs: CronJob[]): CronJobStat[] {
  const stats: CronJobStat[] = [
    { status: 'success', count: 0 },
    { status: 'scheduled', count: 0 },
    { status: 'failure', count: 0 }
  ];
  
  jobs.forEach((job) => {
    if (job.status === 'active') {
      stats.find(s => s.status === 'success')!.count++;
    } else if (job.status === 'inactive') {
      stats.find(s => s.status === 'scheduled')!.count++;
    } else if (job.status === 'error') {
      stats.find(s => s.status === 'failure')!.count++;
    }
  });
  
  return stats;
}

/**
 * Filter jobs based on active tab
 * @param jobs Array of cron jobs
 * @param activeTab Current active tab
 * @returns Filtered jobs based on tab
 */
export function filterJobsByTab(jobs: CronJob[], activeTab: 'active' | 'inactive' | 'all' | 'executions'): CronJob[] {
  if (activeTab === 'active') return jobs.filter(job => job.status === 'active');
  if (activeTab === 'inactive') return jobs.filter(job => job.status === 'inactive' || job.status === 'error');
  return jobs; // 'all' tab returns everything
}
