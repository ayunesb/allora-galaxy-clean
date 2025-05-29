import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorAlertConfig {
  threshold: number;
  timeframe: number; // in minutes
  recipients: string[];
  notification_type: 'email' | 'webhook' | 'in_app';
  webhook_url?: string;
  severity: 'critical' | 'warning';
}

interface AlertResponse {
  triggered: boolean;
  error_count: number;
  threshold: number;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === 'POST') {
      // Get the request body
      const data = await req.json();
      const { tenant_id, alert_config } = data;
      
      if (!alert_config || !tenant_id) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Parse the alert configuration
      const config: ErrorAlertConfig = alert_config;
      
      // Calculate the time range to check
      const timeframe = config.timeframe || 60; // default to 60 minutes
      const fromTime = new Date();
      fromTime.setMinutes(fromTime.getMinutes() - timeframe);
      
      // Query error logs for the tenant within the time range
      const { data: errorLogs, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant_id)
        .eq('event', 'error')
        .gte('created_at', fromTime.toISOString());
      
      if (error) {
        throw error;
      }
      
      // Check if error count exceeds threshold
      const errorCount = errorLogs?.length || 0;
      const thresholdExceeded = errorCount >= config.threshold;
      
      const response: AlertResponse = {
        triggered: thresholdExceeded,
        error_count: errorCount,
        threshold: config.threshold,
        message: thresholdExceeded 
          ? `Alert triggered: ${errorCount} errors detected in the last ${timeframe} minutes (threshold: ${config.threshold})`
          : `No alert: ${errorCount} errors detected in the last ${timeframe} minutes (threshold: ${config.threshold})`
      };
      
      // If threshold is exceeded, send notification
      if (thresholdExceeded) {
        // Log the alert
        await supabase
          .from('system_logs')
          .insert({
            module: 'error_monitoring',
            event: `${config.severity}_error_threshold_exceeded`,
            tenant_id: tenant_id,
            context: {
              error_count: errorCount,
              threshold: config.threshold,
              timeframe: timeframe,
              alert_config: config
            }
          });
        
        // Send webhook if configured
        if (config.notification_type === 'webhook' && config.webhook_url) {
          try {
            const webhookResponse = await fetch(config.webhook_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: 'error_threshold_alert',
                severity: config.severity,
                tenant_id: tenant_id,
                error_count: errorCount,
                threshold: config.threshold,
                timeframe: timeframe,
                timestamp: new Date().toISOString()
              })
            });
            
            if (!webhookResponse.ok) {
              console.error('Failed to send webhook:', await webhookResponse.text());
            }
          } catch (webhookError) {
            console.error('Error sending webhook:', webhookError);
          }
        }
        
        // For email and in-app notifications, in a real implementation
        // you would integrate with your email service or create in-app
        // notifications here
      }
      
      return new Response(
        JSON.stringify({ success: true, data: response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error monitoring error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
