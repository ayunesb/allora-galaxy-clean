
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Try to get email service config
const emailServiceConfig = {
  service: getEnv("EMAIL_SERVICE", "none"), // "resend", "sendgrid", "none"
  apiKey: getEnv("EMAIL_SERVICE_API_KEY", ""),
  fromEmail: getEnv("EMAIL_FROM", "noreply@alloraos.com"),
  fromName: getEnv("EMAIL_FROM_NAME", "Allora OS")
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment not configured correctly" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body", details: String(parseError) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, tenant_id, tenant_name, role, custom_message } = body;

    if (!email || !tenant_id || !tenant_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a unique invitation token
    const token = crypto.randomUUID();
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7); // 7 days validity
    
    // Store the invitation with the token
    const { error: inviteError } = await supabase
      .from('user_invites')
      .insert({
        email,
        tenant_id,
        role,
        token,
        expires_at: expiration.toISOString(),
      });
      
    if (inviteError) {
      throw inviteError;
    }

    // Generate the invitation URL with the token
    const baseUrl = req.headers.get('origin') || supabaseUrl;
    const inviteUrl = `${baseUrl}/invite?token=${token}`;

    // Prepare the invitation email content
    const emailSubject = `Invitation to join ${tenant_name} on Allora OS`;
    const roleText = role ? `as a ${role}` : '';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation to Allora OS</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; 
                   text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You've been invited to Allora OS</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have been invited to join <strong>${tenant_name}</strong> ${roleText} on Allora OS.</p>
            ${custom_message ? `<p>${custom_message}</p>` : ''}
            <p>Click the button below to accept this invitation and create your account:</p>
            <p><a href="${inviteUrl}" class="button">Accept Invitation</a></p>
            <p>This invitation will expire in 7 days.</p>
            <p>If you don't recognize this invitation, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Allora OS - AI-native business operating system</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email (in development/demo mode, we'll just log it)
    let emailSent = false;
    
    if (emailServiceConfig.service === "resend" && emailServiceConfig.apiKey) {
      try {
        // Resend integration would go here
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${emailServiceConfig.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: `${emailServiceConfig.fromName} <${emailServiceConfig.fromEmail}>`,
            to: email,
            subject: emailSubject,
            html: emailHtml
          })
        });
        
        const resendResponse = await response.json();
        emailSent = response.ok;
        
        if (!response.ok) {
          console.error("Resend API error:", resendResponse);
        } else {
          console.log("Email sent via Resend:", resendResponse);
        }
      } catch (emailError) {
        console.error("Error sending email via Resend:", emailError);
      }
    } else if (emailServiceConfig.service === "sendgrid" && emailServiceConfig.apiKey) {
      try {
        // SendGrid integration would go here
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${emailServiceConfig.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: emailServiceConfig.fromEmail, name: emailServiceConfig.fromName },
            subject: emailSubject,
            content: [{ type: "text/html", value: emailHtml }]
          })
        });
        
        emailSent = response.ok;
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("SendGrid API error:", errorText);
        } else {
          console.log("Email sent via SendGrid");
        }
      } catch (emailError) {
        console.error("Error sending email via SendGrid:", emailError);
      }
    }
    
    // In development mode or if email service is not configured, log the email info
    if (!emailSent) {
      console.log(`DEVELOPMENT MODE - Email would be sent to: ${email}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Invitation URL: ${inviteUrl}`);
    }
    
    // Record the email sending in system_logs
    await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        module: 'auth',
        event: 'invitation_sent',
        context: { 
          email, 
          role, 
          invite_url: inviteUrl,
          email_service: emailServiceConfig.service,
          email_sent: emailSent
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent",
        email_service_used: emailServiceConfig.service,
        email_actually_sent: emailSent,
        invite_url: inviteUrl // Included for development/testing
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send invitation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
