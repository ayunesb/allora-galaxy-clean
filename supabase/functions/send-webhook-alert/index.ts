
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: String(parseError)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { 
      tenant_id,
      alert_type,
      title,
      message,
      recipients,
      webhook_urls,
      priority = "normal",
      metadata = {} 
    } = body;

    // Validate required parameters
    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: "tenant_id is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: "title and message are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // At least one delivery method is required
    if ((!recipients || recipients.length === 0) && (!webhook_urls || webhook_urls.length === 0)) {
      return new Response(
        JSON.stringify({ error: "At least one delivery method (recipients or webhook_urls) is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        global: { 
          headers: { Authorization: req.headers.get("Authorization") || "" } 
        },
      }
    );

    // Log the alert event
    const { data: logEntry, error: logError } = await supabaseAdmin
      .from("system_logs")
      .insert({
        tenant_id,
        module: "alerts",
        event: `alert_${alert_type || "generic"}`,
        context: {
          title,
          message,
          priority,
          metadata,
          recipients: recipients?.length || 0,
          webhooks: webhook_urls?.length || 0
        }
      })
      .select()
      .single();

    if (logError) {
      console.error("Error logging alert event:", logError);
      // Continue despite logging error
    }

    // Send in-app notifications to users if recipients are specified
    let notificationResults = [];
    
    if (recipients && recipients.length > 0) {
      // Handle in-app notifications
      try {
        const notificationPromises = recipients.map(async (userId: string) => {
          const { data, error: notifyError } = await supabaseAdmin
            .from("notifications")
            .insert({
              title,
              message,
              type: priority === "high" ? "error" : (priority === "medium" ? "warning" : "info"),
              tenant_id,
              user_id: userId,
              metadata: {
                ...metadata,
                alert_type: alert_type || "system"
              }
            })
            .select();

          if (notifyError) {
            console.error(`Failed to notify user ${userId}:`, notifyError);
            return { userId, success: false, error: notifyError.message };
          }
          
          return { userId, success: true, notification_id: data?.[0]?.id };
        });

        notificationResults = await Promise.allSettled(notificationPromises);
      } catch (notifyError) {
        console.error("Error sending in-app notifications:", notifyError);
      }
    }

    // Send webhook alerts if URLs are specified
    let webhookResults = [];
    
    if (webhook_urls && webhook_urls.length > 0) {
      try {
        const webhookPromises = webhook_urls.map(async (url: string) => {
          try {
            const webhookPayload = {
              tenant_id,
              alert_type: alert_type || "system",
              title,
              message,
              priority,
              timestamp: new Date().toISOString(),
              metadata
            };

            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Source": "Allora-OS-Alert-System",
                "X-Tenant-ID": tenant_id,
                "X-Alert-Type": alert_type || "system"
              },
              body: JSON.stringify(webhookPayload)
            });

            if (!response.ok) {
              throw new Error(`Webhook responded with status ${response.status}: ${response.statusText}`);
            }

            return { url, success: true };
          } catch (webhookError: any) {
            console.error(`Failed to send webhook to ${url}:`, webhookError);
            return { url, success: false, error: webhookError.message };
          }
        });

        webhookResults = await Promise.allSettled(webhookPromises);
      } catch (webhookError) {
        console.error("Error sending webhooks:", webhookError);
      }
    }

    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        log_id: logEntry?.id,
        notifications: notificationResults.map(result => 
          result.status === "fulfilled" ? result.value : { success: false, error: "Failed to process" }
        ),
        webhooks: webhookResults.map(result => 
          result.status === "fulfilled" ? result.value : { success: false, error: "Failed to process" }
        )
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    console.error("Unexpected error in send-webhook-alert function:", err);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: String(err)
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
