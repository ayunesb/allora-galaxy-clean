
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getEnv, SERVICE_ROLE_KEY, PROJECT_URL } from '../_shared/env.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookRequestBody {
  alert_type: string;
  message: string;
  webhook_url: string;
  metadata?: Record<string, any>;
  tenant_id: string;
}

async function sendWebhook(
  webhookUrl: string,
  message: string,
  alertType: string,
  metadata: Record<string, any> = {}
): Promise<Response> {
  try {
    const payload = {
      alert_type: alertType,
      message: message,
      timestamp: new Date().toISOString(),
      metadata: metadata,
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.statusText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook alert sent successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}

async function logWebhookAttempt(
  supabase: any, 
  tenant_id: string, 
  alert_type: string, 
  message: string, 
  success: boolean, 
  error?: string
): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        module: 'webhook',
        level: success ? 'info' : 'error',
        event: 'webhook_alert',
        description: message,
        context: {
          alert_type,
          success,
          error,
          timestamp: new Date().toISOString(),
        },
        tenant_id,
      });
  } catch (logError) {
    console.error('Error logging webhook attempt:', logError);
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);
    const body = await req.json() as WebhookRequestBody;
    
    const { webhook_url, message, alert_type, metadata, tenant_id } = body;

    if (!webhook_url || !message || !alert_type || !tenant_id) {
      throw new Error('Required fields missing: webhook_url, message, alert_type, and tenant_id are required');
    }

    // Send the webhook
    const webhookResponse = await sendWebhook(webhook_url, message, alert_type, metadata);
    const success = webhookResponse.status === 200;

    // Log the webhook attempt
    let errorMessage;
    if (!success) {
      const errorBody = await webhookResponse.json();
      errorMessage = errorBody.error || 'Unknown error';
    }

    await logWebhookAttempt(supabase, tenant_id, alert_type, message, success, errorMessage);

    return webhookResponse;
  } catch (error) {
    console.error('Error processing webhook request:', error);
    
    // Try to log the error
    try {
      const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);
      await logWebhookAttempt(
        supabase, 
        'system', // Default tenant if not provided
        'error', 
        'Failed to process webhook request', 
        false, 
        error.message
      );
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
