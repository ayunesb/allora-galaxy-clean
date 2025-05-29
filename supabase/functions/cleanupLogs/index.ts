import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to safely get environment variables
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get retention settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'log_retention')
      .single();
    
    if (settingsError) {
      console.error("Error fetching retention settings:", settingsError);
      // Use default values if settings not found
      settings = {
        value: {
          plugin_logs_days: 30,
          system_logs_days: 90,
          executions_days: 60
        }
      };
    }
    
    const retentionDays = settings.value;
    console.log("Using retention settings:", retentionDays);
    
    // Start tracking cleanup metrics
    const results = {
      plugin_logs_deleted: 0,
      system_logs_deleted: 0,
      executions_deleted: 0,
      cron_history_deleted: 0
    };

    // Clean up plugin_logs
    const pluginLogsDate = new Date();
    pluginLogsDate.setDate(pluginLogsDate.getDate() - retentionDays.plugin_logs_days);
    
    const { data: deletedPluginLogs, error: pluginLogsError } = await supabase
      .from('plugin_logs')
      .delete()
      .lt('created_at', pluginLogsDate.toISOString())
      .select('count');
    
    if (pluginLogsError) {
      console.error("Error cleaning up plugin logs:", pluginLogsError);
    } else {
      results.plugin_logs_deleted = deletedPluginLogs?.length || 0;
      console.log(`Deleted ${results.plugin_logs_deleted} plugin logs`);
    }

    // Clean up system_logs
    const systemLogsDate = new Date();
    systemLogsDate.setDate(systemLogsDate.getDate() - retentionDays.system_logs_days);
    
    const { data: deletedSystemLogs, error: systemLogsError } = await supabase
      .from('system_logs')
      .delete()
      .lt('created_at', systemLogsDate.toISOString())
      .select('count');
    
    if (systemLogsError) {
      console.error("Error cleaning up system logs:", systemLogsError);
    } else {
      results.system_logs_deleted = deletedSystemLogs?.length || 0;
      console.log(`Deleted ${results.system_logs_deleted} system logs`);
    }

    // Clean up executions table if it exists
    const executionsDate = new Date();
    executionsDate.setDate(executionsDate.getDate() - (retentionDays.executions_days || 60));
    
    try {
      const { data: deletedExecutions, error: executionsError } = await supabase
        .from('executions')
        .delete()
        .lt('created_at', executionsDate.toISOString())
        .not('status', 'eq', 'pending') // Don't delete pending executions
        .select('count');
      
      if (executionsError) {
        console.error("Error cleaning up executions:", executionsError);
      } else {
        results.executions_deleted = deletedExecutions?.length || 0;
        console.log(`Deleted ${results.executions_deleted} executions`);
      }
    } catch (error) {
      console.error("Error accessing executions table:", error);
    }

    // Clean up cron_job_history older than 30 days
    const cronHistoryDate = new Date();
    cronHistoryDate.setDate(cronHistoryDate.getDate() - 30);
    
    try {
      const { data: deletedCronHistory, error: cronHistoryError } = await supabase
        .from('cron_job_history')
        .delete()
        .lt('execution_time', cronHistoryDate.toISOString())
        .select('count');
      
      if (cronHistoryError) {
        console.error("Error cleaning up cron job history:", cronHistoryError);
      } else {
        results.cron_history_deleted = deletedCronHistory?.length || 0;
        console.log(`Deleted ${results.cron_history_deleted} cron job history records`);
      }
    } catch (error) {
      console.error("Error accessing cron job history:", error);
    }

    // Log the cleanup event
    await supabase
      .from('system_logs')
      .insert({
        module: 'system',
        event: 'logs_cleanup',
        context: {
          ...results,
          plugin_logs_retention_days: retentionDays.plugin_logs_days,
          system_logs_retention_days: retentionDays.system_logs_days,
          executions_retention_days: retentionDays.executions_days || 60
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Log cleanup completed successfully",
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in cleanupLogs:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to clean up logs", 
        details: error.message || String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
