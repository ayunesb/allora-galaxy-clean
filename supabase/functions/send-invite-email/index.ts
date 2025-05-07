
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, tenant_id, tenant_name, role } = await req.json();

    if (!email || !tenant_id || !tenant_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a unique invitation token
    const token = crypto.randomUUID();
    
    // Store the invitation with the token
    const { error: inviteError } = await supabase
      .from('user_invites')
      .insert({
        email,
        tenant_id,
        role,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
      
    if (inviteError) {
      throw inviteError;
    }

    // Generate the invitation URL with the token
    const inviteUrl = `${req.headers.get('origin') || supabaseUrl}/invite?token=${token}`;

    // Log the invitation for development purposes
    console.log(`Invitation URL for ${email}: ${inviteUrl}`);
    
    // In a real application, send an email using a service like SendGrid, Postmark, or SMTP
    // For now, we'll just simulate sending an email by logging to the console
    console.log(`Sending invitation email to ${email} for workspace ${tenant_name} with role ${role}`);
    
    // Record the email sending in system_logs
    await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        module: 'auth',
        event: 'invitation_sent',
        context: { email, role, invite_url: inviteUrl }
      });

    return new Response(
      JSON.stringify({ success: true }),
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
