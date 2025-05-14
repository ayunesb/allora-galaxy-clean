
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// Import shared utilities
import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse,
  getEnv,
  parseJsonBody,
  handleCorsRequest,
  withRetry,
  validateRequiredFields,
  logSystemEvent
} from "../_shared/edgeUtils.ts";

// Job registry for validation
const VALID_JOBS = [
  'update_kpis_daily',
  'sync_mqls_weekly',
  'auto_evolve_agents_daily',
  'scheduled-intelligence-daily',
  'cleanup_old_execution_logs'
];

interface JobInput {
  job_name: string;
  tenant_id?: string;
  options?: Record<string, any>;
  manual_trigger?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  const requestId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[${requestId}] triggerCronJob request received`);

  try {
    // Initialize Supabase client
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return createErrorResponse("Missing Supabase credentials", undefined, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    let jobInput: JobInput;
    try {
      jobInput = await parseJsonBody<JobInput>(req);
    } catch (parseError) {
      return createErrorResponse(
        "Invalid JSON in request body",
        String(parseError),
        400
      );
    }
    
    // Validate required fields
    const missingFields = validateRequiredFields(jobInput, ['job_name']);
    if (missingFields.length > 0) {
      return createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        { fields: missingFields },
        400
      );
    }
    
    // Validate job name
    if (!VALID_JOBS.includes(jobInput.job_name)) {
      return createErrorResponse(
        `Invalid job name: ${jobInput.job_name}`,
        { valid_jobs: VALID_JOBS },
        400
      );
    }

    console.log(`[${requestId}] Triggering job: ${jobInput.job_name}`);

    // Log the job execution start with retry logic
    let jobId: string;
    try {
      const { data: jobStartData, error: jobStartError } = await withRetry(
        () => supabase.rpc(
          'log_cron_job_start',
          { 
            job_name: jobInput.job_name, 
            metadata: { 
              manual_trigger: jobInput.manual_trigger ?? true,
              tenant_id: jobInput.tenant_id,
              request_id: requestId
            } 
          }
        ),
        { retries: 2, delay: 300 }
      );

      if (jobStartError) {
        console.error(`[${requestId}] Error logging job start:`, jobStartError);
        // Continue anyway but log the error
      }

      jobId = jobStartData || `fallback_${requestId}`;
    } catch (logError) {
      console.warn(`[${requestId}] Failed to log job start, continuing anyway:`, logError);
      jobId = `fallback_${requestId}`;
    }

    try {
      let result;
      const startTime = Date.now();

      // Determine which job to execute based on job_name
      switch (jobInput.job_name) {
        case 'update_kpis_daily':
          result = await withRetry(
            () => supabase.functions.invoke('updateKPIs', {
              body: { 
                check_all_tenants: !jobInput.tenant_id, 
                tenant_id: jobInput.tenant_id,
                run_mode: "manual", 
                ...jobInput.options
              }
            }),
            { retries: 3, delay: 1000 }
          );
          break;
          
        case 'sync_mqls_weekly':
          result = await withRetry(
            () => supabase.functions.invoke('syncMQLs', {
              body: { 
                check_all_tenants: !jobInput.tenant_id, 
                tenant_id: jobInput.tenant_id,
                run_mode: "manual",
                ...jobInput.options
              }
            }),
            { retries: 3, delay: 1000 }
          );
          break;
          
        case 'auto_evolve_agents_daily':
          result = await withRetry(
            () => supabase.functions.invoke('autoEvolveAgents', {
              body: { 
                check_all_tenants: !jobInput.tenant_id, 
                tenant_id: jobInput.tenant_id,
                run_mode: "manual", 
                requires_approval: true,
                ...jobInput.options
              }
            }),
            { retries: 2, delay: 1000 }
          );
          break;
          
        case 'scheduled-intelligence-daily':
          result = await withRetry(
            () => supabase.functions.invoke('scheduledIntelligence', {
              body: { 
                type: "daily_run", 
                manual_trigger: true,
                tenant_id: jobInput.tenant_id,
                ...jobInput.options
              }
            }),
            { retries: 2, delay: 1000 }
          );
          break;
          
        case 'cleanup_old_execution_logs':
          // For DB operations that don't have edge functions, execute SQL directly via RPC
          const { error: sqlError } = await withRetry(
            () => supabase.rpc('execute_scheduled_cleanup', jobInput.options || {}),
            { retries: 1, delay: 500 }
          );
          
          if (sqlError) {
            throw new Error(`SQL execution error: ${sqlError.message}`);
          }
          
          result = { 
            data: { 
              success: true, 
              message: "Cleanup completed successfully" 
            } 
          };
          break;
          
        default:
          throw new Error(`Unknown job: ${jobInput.job_name}`);
      }

      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Log the job execution completion with retry
      try {
        await withRetry(
          () => supabase.rpc(
            'log_cron_job_completion',
            { 
              job_id: jobId,
              duration_ms: executionTime,
              error_message: result.error ? result.error.message : null,
              result: result.data || null
            }
          ),
          { retries: 2, delay: 300 }
        );
      } catch (logCompletionError) {
        console.error(`[${requestId}] Error logging job completion:`, logCompletionError);
        // Continue anyway as the job was executed successfully
      }
      
      // Log system event for successful job execution
      await logSystemEvent(
        supabase,
        'cron',
        'job_executed',
        {
          job_name: jobInput.job_name,
          execution_time_ms: executionTime,
          manual_trigger: jobInput.manual_trigger ?? true,
          tenant_id: jobInput.tenant_id
        },
        jobInput.tenant_id
      );

      // Return success response
      return createSuccessResponse({
        job_name: jobInput.job_name,
        job_id: jobId,
        result: result.data,
        execution_time_ms: executionTime,
      }, "Job executed successfully");
      
    } catch (error) {
      console.error(`[${requestId}] Error executing job ${jobInput.job_name}:`, error);
      
      // Log the job execution failure
      try {
        await supabase.rpc(
          'log_cron_job_completion',
          { 
            job_id: jobId,
            error_message: error.message || "Unknown error",
            status: 'failed'
          }
        );
      } catch (logError) {
        console.error(`[${requestId}] Error logging job failure:`, logError);
      }
      
      // Log system event for failed job
      await logSystemEvent(
        supabase,
        'cron',
        'job_failed',
        {
          job_name: jobInput.job_name,
          error: error.message || String(error),
          manual_trigger: jobInput.manual_trigger ?? true,
          tenant_id: jobInput.tenant_id
        },
        jobInput.tenant_id
      );
      
      return createErrorResponse(
        `Failed to execute job ${jobInput.job_name}`,
        {
          job_id: jobId,
          details: error.message || String(error)
        },
        500
      );
    }
  } catch (error) {
    console.error(`[${requestId}] Unhandled error in triggerCronJob:`, error);
    
    return createErrorResponse(
      "Failed to process CRON job request", 
      error.message || String(error),
      500
    );
  }
});
