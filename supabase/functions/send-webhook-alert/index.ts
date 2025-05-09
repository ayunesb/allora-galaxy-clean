
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to safely get environment variables
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) || fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { 
      webhookUrl, 
      message, 
      title, 
      severity = 'info',
      source = 'Allora OS',
      data = {}
    } = await req.json();
    
    // Check for default webhook URL if not provided
    const targetUrl = webhookUrl || getEnv('SLACK_WEBHOOK_URL') || getEnv('ZAPIER_WEBHOOK_URL');
    
    // Validate required fields
    if (!targetUrl) {
      throw new Error('No webhook URL provided or configured');
    }
    
    if (!message) {
      throw new Error('Message is required');
    }
    
    // Prepare payload for the webhook
    // Format adapts to common webhook patterns (Slack, Discord, custom)
    const payload = {
      text: message,
      title: title || `Allora OS Alert: ${severity.toUpperCase()}`,
      summary: `${title || 'Alert'}: ${message}`,
      color: getSeverityColor(severity),
      timestamp: new Date().toISOString(),
      source,
      severity,
      data
    };
    
    console.log(`Sending webhook to ${targetUrl}`);
    
    // Send webhook
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook request failed with status ${response.status}: ${errorText}`);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook alert sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Webhook alert error:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to get color based on severity
function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'error':
      return '#FF0000'; // Red
    case 'warning':
      return '#FFA500'; // Orange
    case 'success':
      return '#00FF00'; // Green
    case 'info':
    default:
      return '#0000FF'; // Blue
  }
}
