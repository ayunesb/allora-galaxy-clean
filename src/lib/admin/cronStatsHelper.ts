import { CronJob, CronJobStat } from "@/types/admin/cronJobs";

type CronJobStatus = "active" | "inactive" | "error";

/**
 * Calculate stats for CRON jobs
 * @param jobs Array of cron jobs
 * @returns Stats object with counts
 */
export function calculateJobStats(jobs: CronJob[]): CronJobStat[] {
  // Only use allowed statuses: 'active', 'inactive', 'error'
  const stats: Record<"active" | "inactive" | "error", number> = {
    active: 0,
    inactive: 0,
    error: 0,
  };

  if (!jobs || jobs.length === 0) {
    return Object.entries(stats).map(([status, count]) => ({ status, count }));
  }

  jobs.forEach((job) => {
    switch (job.status) {
      case "active":
        stats.active++;
        break;
      case "inactive":
        stats.inactive++;
        break;
      case "error":
        stats.error++;
        break;
      default:
        stats.inactive++;
    }
  });

  return Object.entries(stats).map(([status, count]) => ({
    status,
    count,
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
  tab: "active" | "inactive" | "all" | "executions",
): CronJob[] {
  if (tab === "all") {
    return jobs;
  }

  if (tab === "active") {
    return jobs.filter((job) => job.status === "active");
  }

  if (tab === "inactive") {
    return jobs.filter(
      (job) => job.status === "inactive" || job.status === "error",
    );
  }

  return jobs;
}

/**
 * Filter jobs by time range
 * @param jobs Array of CRON jobs
 * @param timeRange Time range value
 * @returns Filtered jobs
 */
export function filterJobsByTimeRange(
  jobs: CronJob[],
  timeRange: string,
): CronJob[] {
  if (!timeRange || timeRange === "all") {
    return jobs;
  }

  const now = new Date();
  let cutoffDate: Date;

  switch (timeRange) {
    case "day":
      cutoffDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case "week":
      cutoffDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      cutoffDate = new Date(now.setDate(now.getDate() - 30));
      break;
    default:
      return jobs;
  }

  return jobs.filter((job) => {
    const lastRunDate = job.last_run ? new Date(job.last_run) : null;
    return lastRunDate && lastRunDate >= cutoffDate;
  });
}

export function getStatusLabel(status: CronJobStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "error":
      return "Error";
    default:
      return "Unknown";
  }
}

export function getActiveJobs(jobs: { status: CronJobStatus }[]) {
  return jobs.filter((job) => job.status === "active");
}

export function getInactiveOrErrorJobs(jobs: { status: CronJobStatus }[]) {
  return jobs.filter(
    (job) => job.status === "inactive" || job.status === "error",
  );
}
