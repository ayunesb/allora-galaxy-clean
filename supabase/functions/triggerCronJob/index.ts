import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// Deno deploy functions should use remote URLs for imports and .ts extensions.
// If you are running locally with Node, you will get errors for these imports.
// To run/test locally, use Deno, not Node, or set up a Deno-compatible environment.

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

    // Parse request body
    const { job_name } = await req.json();

    if (!job_name) {
      return new Response(
        JSON.stringify({ error: "job_name is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Log the job execution start
    const { data: jobStartData, error: jobStartError } = await supabase.rpc(
      'log_cron_job_start',
      { job_name, metadata: { manual_trigger: true } }
    );

    if (jobStartError) {
      console.error("Error logging job start:", jobStartError);
    }

    const jobId = jobStartData;

    try {
      let result;

      // Determine which job to execute based on job_name
      switch (job_name) {
        case 'update_kpis_daily':
          result = await supabase.functions.invoke('updateKPIs', {
            body: { check_all_tenants: true, run_mode: "manual" }
          });
          break;
          
        case 'sync_mqls_weekly':
          result = await supabase.functions.invoke('syncMQLs', {
            body: { check_all_tenants: true, run_mode: "manual" }
          });
          break;
          
        case 'auto_evolve_agents_daily':
          result = await supabase.functions.invoke('autoEvolveAgents', {
            body: { check_all_tenants: true, run_mode: "manual", requires_approval: true }
          });
          break;
          
        case 'scheduled-intelligence-daily':
          result = await supabase.functions.invoke('scheduledIntelligence', {
            body: { type: "daily_run", manual_trigger: true }
          });
          break;
          
        case 'cleanup_old_execution_logs':
          // For DB operations that don't have edge functions, execute SQL directly
          const { error: sqlError } = await supabase.rpc('execute_scheduled_cleanup');
          if (sqlError) {
            throw new Error(`SQL execution error: ${sqlError.message}`);
          }
          result = { data: { success: true, message: "Cleanup completed successfully" } };
          break;
          
        default:
          throw new Error(`Unknown job: ${job_name}`);
      }

      // Calculate execution time
      const executionTime = Date.now() - new Date(req.headers.get('date') || Date.now()).getTime();
      
      // Log the job execution completion
      await supabase.rpc(
        'log_cron_job_completion',
        { 
          job_id: jobId,
          duration_ms: executionTime,
          error_message: result.error ? result.error.message : null
        }
      );

      // Return the result
      return new Response(
        JSON.stringify({
          success: true,
          job_name,
          result: result.data,
          execution_time_ms: executionTime,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (error) {
      console.error(`Error executing job ${job_name}:`, error);
      
      // Log the job execution failure
      await supabase.rpc(
        'log_cron_job_completion',
        { 
          job_id: jobId,
          error_message: error.message || "Unknown error"
        }
      );
      
      throw error;
    }
  } catch (error) {
    console.error("Error in triggerCronJob:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to trigger CRON job", 
        details: error.message || String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
