import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

/**
 * Clean up old log entries based on retention settings
 * @returns Information about the cleanup operation
 */
export async function cleanupOldLogs() {
  try {
    // Fetch retention settings
    const { data: settings, error: settingsError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "log_retention")
      .single();

    if (settingsError) {
      throw new Error(
        `Failed to fetch log retention settings: ${settingsError.message}`,
      );
    }

    const retentionDays = {
      plugin_logs: settings?.value?.plugin_logs_days || 30,
      system_logs: settings?.value?.system_logs_days || 90,
    };

    // Delete old plugin logs
    const pluginLogsRetention = new Date();
    pluginLogsRetention.setDate(
      pluginLogsRetention.getDate() - retentionDays.plugin_logs,
    );

    const { data: deletedPluginLogs, error: pluginLogsError } = await supabase
      .from("plugin_logs")
      .delete()
      .lt("created_at", pluginLogsRetention.toISOString())
      .select("count");

    if (pluginLogsError) {
      throw new Error(
        `Failed to clean up plugin logs: ${pluginLogsError.message}`,
      );
    }

    // Delete old system logs
    const systemLogsRetention = new Date();
    systemLogsRetention.setDate(
      systemLogsRetention.getDate() - retentionDays.system_logs,
    );

    const { data: deletedSystemLogs, error: systemLogsError } = await supabase
      .from("system_logs")
      .delete()
      .lt("created_at", systemLogsRetention.toISOString())
      .select("count");

    if (systemLogsError) {
      throw new Error(
        `Failed to clean up system logs: ${systemLogsError.message}`,
      );
    }

    // Log the cleanup event
    await logSystemEvent("system", "info", {
      event: "logs_cleanup",
      description: "Logs cleanup event",
    });

    return {
      success: true,
      plugin_logs_deleted: deletedPluginLogs?.length || 0,
      system_logs_deleted: deletedSystemLogs?.length || 0,
    };
  } catch (error: unknown) {
    console.error("Error during log cleanup:", error);

    // Try to log the failure
    await logSystemEvent("system", "error", {
      event: "logs_cleanup_failed",
      description: "Logs cleanup failed event",
    });

    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
