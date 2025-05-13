import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Helper function to safely get environment variables
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Get API key from environment variable
const resendApiKey = getEnv('RESEND_API_KEY');

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  templateData?: Record<string, any>;
  tenant_id?: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

// Add request tracking for better observability
const emailRequests: Record<string, {
  startTime: number;
  request?: Partial<EmailRequest>;
  status?: string;
  error?: string;
  recipient_count?: number;
}> = {};

serve(async (req) => {
  // Generate unique request ID
  const requestId = crypto.randomUUID();
  emailRequests[requestId] = {
    startTime: Date.now()
  };
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key, with fallback to environment variable
    const apiKey = resendApiKey || getEnv('RESEND_API_KEY');
    
    // Validate that API key exists
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    // Initialize Resend client
    const resend = new Resend(apiKey);

    // Parse request body with error handling
    let requestData: EmailRequest;
    try {
      requestData = await req.json();
      emailRequests[requestId].request = {
        to: requestData.to,
        subject: requestData.subject,
        from: requestData.from,
        priority: requestData.priority,
        tenant_id: requestData.tenant_id
      };
      
      // Track recipient count for metrics
      if (Array.isArray(requestData.to)) {
        emailRequests[requestId].recipient_count = requestData.to.length;
      } else {
        emailRequests[requestId].recipient_count = 1;
      }
    } catch (error) {
      throw new Error(`Invalid JSON payload: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Validate required fields
    if (!requestData.to || !requestData.subject || (!requestData.html && !requestData.text)) {
      emailRequests[requestId].status = 'validation_error';
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Required fields missing: 'to', 'subject', and either 'html' or 'text' must be provided",
          request_id: requestId
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Set status for tracking
    emailRequests[requestId].status = 'sending';

    // Log system info for audit purposes
    console.log(`[${requestId}] Send email function called with: to=${Array.isArray(requestData.to) ? requestData.to.join(',') : requestData.to}, subject=${requestData.subject}`);

    // Prepare email data for sending
    const emailData = {
      from: requestData.from || "Allora OS <no-reply@alloraos.com>",
      to: requestData.to,
      subject: requestData.subject,
      html: requestData.html,
      text: requestData.text,
      reply_to: requestData.replyTo,
      cc: requestData.cc,
      bcc: requestData.bcc,
      tags: [
        {
          name: "request_id",
          value: requestId
        },
        {
          name: "priority",
          value: requestData.priority || "normal" 
        },
        {
          name: "tenant_id",
          value: requestData.tenant_id || "unknown"
        }
      ]
    };

    // Send email with timeout handling
    console.log(`[${requestId}] Sending email to: ${Array.isArray(requestData.to) ? requestData.to.join(', ') : requestData.to}`);
    
    // Set a timeout for the email sending operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout after 10s')), 10000);
    });
    
    try {
      // Race the email sending against the timeout
      const { data, error } = await Promise.race([
        resend.emails.send(emailData),
        timeoutPromise
      ]) as { data?: any, error?: any };

      if (error) {
        emailRequests[requestId].status = 'error';
        emailRequests[requestId].error = error.message || String(error);
        console.error(`[${requestId}] Error sending email:`, error);
        throw error;
      }

      emailRequests[requestId].status = 'sent';
      console.log(`[${requestId}] Email sent successfully, ID:`, data?.id);
      
      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          id: data?.id,
          request_id: requestId,
          execution_time_ms: Date.now() - emailRequests[requestId].startTime
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        emailRequests[requestId].error = error.message;
        
        // Handle specific error types for better user feedback
        if (error.message.includes('timeout')) {
          emailRequests[requestId].status = 'timeout';
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Email service timed out. Please try again later.",
              request_id: requestId,
              execution_time_ms: Date.now() - emailRequests[requestId].startTime
            }),
            { 
              status: 504,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } else if (error.message.includes('rate limit')) {
          emailRequests[requestId].status = 'rate_limited';
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Email sending rate limit exceeded. Please try again later.",
              request_id: requestId,
              execution_time_ms: Date.now() - emailRequests[requestId].startTime
            }),
            { 
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } else if (error.message.includes('invalid email')) {
          emailRequests[requestId].status = 'invalid_email';
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "One or more email addresses are invalid.",
              request_id: requestId,
              execution_time_ms: Date.now() - emailRequests[requestId].startTime
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      // Generic error response for other cases
      console.error(`[${requestId}] Email sending error:`, error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          request_id: requestId,
          execution_time_ms: Date.now() - emailRequests[requestId].startTime
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error(`[${requestId}] Email sending error:`, error);
    emailRequests[requestId].status = 'error';
    emailRequests[requestId].error = error instanceof Error ? error.message : String(error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        request_id: requestId,
        execution_time_ms: Date.now() - emailRequests[requestId].startTime
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } finally {
    // Cleanup old request tracking data (keep last 200 requests)
    const requestIds = Object.keys(emailRequests);
    if (requestIds.length > 200) {
      const oldestIds = requestIds
        .sort((a, b) => emailRequests[a].startTime - emailRequests[b].startTime)
        .slice(0, requestIds.length - 200);
      
      oldestIds.forEach(id => delete emailRequests[id]);
    }
  }
});
