
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequestBody {
  email: string;
  role: string;
  tenant_id: string;
  tenant_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { email, role, tenant_id, tenant_name } = await req.json() as InviteRequestBody;

    // Generate a unique token for this invitation
    const token = crypto.randomUUID();
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7); // Token expires in 7 days

    // Check if user already exists in the auth system
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(user => user.email === email);
    
    let userId = existingUser?.id;
    
    // Insert or update the user_invites record
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('user_invites')
      .upsert({
        email,
        token,
        tenant_id,
        role,
        expires_at: expiration.toISOString(),
        user_id: userId || null,
      })
      .select()
      .single();

    if (inviteError) {
      throw new Error(`Failed to create invitation: ${inviteError.message}`);
    }

    // If the user exists, add them to the tenant with the pending role
    if (userId) {
      // Check if the user already has a role in this tenant
      const { data: existingRole } = await supabaseAdmin
        .from('tenant_user_roles')
        .select()
        .eq('user_id', userId)
        .eq('tenant_id', tenant_id)
        .maybeSingle();
      
      if (!existingRole) {
        // Add the user to the tenant with a pending role
        await supabaseAdmin
          .from('tenant_user_roles')
          .insert({
            tenant_id,
            user_id: userId,
            role: 'pending', // They'll be upgraded to the proper role when they accept
          });
      }
    }

    // Create invitation URL
    const baseUrl = req.headers.get('origin') || 'http://localhost:8080';
    const invitationUrl = `${baseUrl}/invite?token=${token}`;

    // Send email (in a real implementation, you'd use a service like Postmark, SendGrid, etc.)
    // For now, we'll just log the invitation URL
    console.log(`Invitation URL for ${email}: ${invitationUrl}`);
    
    // Log the invitation in the system logs
    await supabaseAdmin.from('system_logs').insert({
      module: 'invitations',
      event: 'invitation_created',
      context: {
        email,
        tenant_id,
        tenant_name,
        role,
        invitation_url: invitationUrl,
      }
    });

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
        invitation_id: invitation.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in invite function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
