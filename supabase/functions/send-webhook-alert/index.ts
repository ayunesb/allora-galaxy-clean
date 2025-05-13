import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

interface WebhookAlertConfig {
  webhook_url: string;
  alert_type: string;
  message: string;
  tenant_id: string;
  metadata?: Record<string, any>;
  retry_count?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// Add request tracking for debugging
const requestTracker: Record<string, {
  startTime: number;
  config?: WebhookAlertConfig;
  status?: string;
  error?: string;
}> = {};

serve(async (req) => {
  // Generate a unique request ID for tracking
  const requestId = crypto.randomUUID();
  requestTracker[requestId] = {
    startTime: Date.now()
  };
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    let config: WebhookAlertConfig;
    try {
      config = await req.json();
      requestTracker[requestId].config = config;
    } catch (error) {
      throw new Error(`Invalid JSON payload: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Validate required fields
    if (!config.webhook_url || !config.alert_type || !config.message || !config.tenant_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields',
          requestId 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Set default retry count and priority if not provided
    const retryCount = config.retry_count ?? 0;
    const priority = config.priority ?? 'medium';
    
    // Log the webhook alert to system_logs
    const logResult = await supabase
      .from('system_logs')
      .insert({
        tenant_id: config.tenant_id,
        module: 'webhook',
        event: `webhook_alert_${config.alert_type}`,
        context: {
          webhook_url: config.webhook_url,
          alert_type: config.alert_type,
          message: config.message,
          priority,
          retry_count: retryCount,
          request_id: requestId,
          metadata: config.metadata || {}
        }
      });
      
    if (logResult.error) {
      console.warn(`Warning: Failed to log webhook alert: ${logResult.error.message}`);
      // Continue with webhook send even if logging fails
    }
    
    // Prepare the webhook payload
    const payload = {
      type: config.alert_type,
      message: config.message,
      timestamp: new Date().toISOString(),
      tenant_id: config.tenant_id,
      priority,
      request_id: requestId,
      ...config.metadata
    };
    
    // Set request tracking status
    requestTracker[requestId].status = 'sending';
    
    // Send the webhook request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json().catch(() => ({}));
      requestTracker[requestId].status = 'success';
      
      // Log successful webhook delivery
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: config.tenant_id,
          module: 'webhook',
          event: `webhook_delivered_${config.alert_type}`,
          context: {
            webhook_url: config.webhook_url,
            request_id: requestId,
            execution_time_ms: Date.now() - requestTracker[requestId].startTime,
            response: responseData
          }
        }).then(result => {
          if (result.error) {
            console.warn(`Warning: Failed to log webhook success: ${result.error.message}`);
          }
        });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: responseData,
          requestId,
          executionTimeMs: Date.now() - requestTracker[requestId].startTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific error types
      const errorMsg = error instanceof Error ? error.message : String(error);
      let statusCode = 500;
      let shouldRetry = false;
      
      if (error.name === 'AbortError') {
        statusCode = 504; // Gateway Timeout
        shouldRetry = true;
        requestTracker[requestId].status = 'timeout';
      } else if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ENOTFOUND')) {
        statusCode = 502; // Bad Gateway
        shouldRetry = true;
        requestTracker[requestId].status = 'connection_failed';
      } else if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests')) {
        statusCode = 429; // Too Many Requests
        shouldRetry = true;
        requestTracker[requestId].status = 'rate_limited';
      } else {
        requestTracker[requestId].status = 'failed';
      }
      
      requestTracker[requestId].error = errorMsg;
      
      // Log webhook failure
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: config.tenant_id,
          module: 'webhook',
          event: `webhook_failed_${config.alert_type}`,
          context: {
            webhook_url: config.webhook_url,
            request_id: requestId,
            error: errorMsg,
            status_code: statusCode,
            should_retry: shouldRetry,
            retry_count: retryCount,
            execution_time_ms: Date.now() - requestTracker[requestId].startTime,
          }
        }).then(result => {
          if (result.error) {
            console.warn(`Warning: Failed to log webhook failure: ${result.error.message}`);
          }
        });
      
      // Return detailed error information
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMsg,
          requestId,
          statusCode,
          shouldRetry,
          retryCount,
          executionTimeMs: Date.now() - requestTracker[requestId].startTime
        }),
        { 
          status: statusCode, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Webhook alert error:', errorMsg);
    requestTracker[requestId].status = 'error';
    requestTracker[requestId].error = errorMsg;
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMsg,
        requestId,
        executionTimeMs: Date.now() - requestTracker[requestId].startTime
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } finally {
    // Clean up old request tracking data (keep only last 100 entries)
    const requestIds = Object.keys(requestTracker);
    if (requestIds.length > 100) {
      const oldestIds = requestIds
        .sort((a, b) => requestTracker[a].startTime - requestTracker[b].startTime)
        .slice(0, requestIds.length - 100);
      
      oldestIds.forEach(id => delete requestTracker[id]);
    }
  }
});
