import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/lib/errors/ErrorHandler";
import { CronJob, CronExecution } from "@/types/admin/cronJobs";

/**
 * Fetch all CRON jobs
 */
export async function fetchJobs() {
  try {
    const { data, error } = await supabase
      .from("cron_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { data: data as CronJob[] };
  } catch (error) {
    console.error("Error fetching CRON jobs:", error);
    await handleError(error, {
      context: { service: "cronJobsService", method: "fetchJobs" },
    });
    return { error, data: null };
  }
}

/**
 * Fetch executions for a specific job
 */
export async function fetchExecutions(jobId: string) {
  try {
    const { data, error } = await supabase
      .from("cron_executions")
      .select("*")
      .eq("job_id", jobId)
      .order("start_time", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return { data: data as CronExecution[] };
  } catch (error) {
    console.error(`Error fetching executions for job ${jobId}:`, error);
    await handleError(error, {
      context: { service: "cronJobsService", method: "fetchExecutions", jobId },
    });
    return { error, data: null };
  }
}

/**
 * Pause a CRON job
 */
export async function pauseJob(jobName: string) {
  try {
    const { data, error } = await supabase.functions.invoke("admin-cron-job", {
      body: { action: "pause", jobName },
    });

    if (error) {
      throw error;
    }

    return { data };
  } catch (error) {
    console.error(`Error pausing job ${jobName}:`, error);
    await handleError(error, {
      context: { service: "cronJobsService", method: "pauseJob", jobName },
    });
    return { error, data: null };
  }
}

/**
 * Resume a CRON job
 */
export async function resumeJob(jobName: string) {
  try {
    const { data, error } = await supabase.functions.invoke("admin-cron-job", {
      body: { action: "resume", jobName },
    });

    if (error) {
      throw error;
    }

    return { data };
  } catch (error) {
    console.error(`Error resuming job ${jobName}:`, error);
    await handleError(error, {
      context: { service: "cronJobsService", method: "resumeJob", jobName },
    });
    return { error, data: null };
  }
}

/**
 * Run a CRON job immediately
 */
export async function runJob(jobName: string) {
  try {
    const { data, error } = await supabase.functions.invoke("admin-cron-job", {
      body: { action: "run", jobName },
    });

    if (error) {
      throw error;
    }

    return { data };
  } catch (error) {
    console.error(`Error running job ${jobName}:`, error);
    await handleError(error, {
      context: { service: "cronJobsService", method: "runJob", jobName },
    });
    return { error, data: null };
  }
}

/**
 * Fetch executions filtered by time range
 */
export async function fetchExecutionsByTimeRange(timeRange: string) {
  try {
    let query = supabase
      .from("cron_executions")
      .select("*")
      .order("start_time", { ascending: false });

    // Apply time range filter
    if (timeRange === "day") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      query = query.gte("start_time", yesterday.toISOString());
    } else if (timeRange === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query = query.gte("start_time", lastWeek.toISOString());
    } else if (timeRange === "month") {
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      query = query.gte("start_time", lastMonth.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data: data as CronExecution[] };
  } catch (error) {
    console.error(
      `Error fetching executions by time range ${timeRange}:`,
      error,
    );
    await handleError(error, {
      context: {
        service: "cronJobsService",
        method: "fetchExecutionsByTimeRange",
        timeRange,
      },
    });
    return { error, data: null };
  }
}
