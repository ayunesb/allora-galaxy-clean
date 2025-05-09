
// Supabase Edge Function for sending emails
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Get API key from environment variable
const resendApiKey = Deno.env.get('RESEND_API_KEY');

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
  templateId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate that API key exists
    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    // Initialize Resend client
    const resend = new Resend(resendApiKey);

    // Parse request body
    const requestData: EmailRequest = await req.json();

    // Validate required fields
    if (!requestData.to || !requestData.subject || (!requestData.html && !requestData.text && !requestData.templateId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Required fields missing: 'to', 'subject', and either 'html', 'text', or 'templateId' must be provided" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
    };

    // Send email
    console.log(`Sending email to: ${Array.isArray(requestData.to) ? requestData.to.join(', ') : requestData.to}`);
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully, ID:', data?.id);
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    
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
