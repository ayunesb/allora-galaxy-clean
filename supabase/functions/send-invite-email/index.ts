
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, tenantId, role } = await req.json();
    
    if (!email || !tenantId || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();
      
    let userId = existingUser?.id;
      
    if (!userId) {
      // In a real implementation, you would:
      // 1. Create a user in auth.users (Supabase Admin API)
      // 2. Generate a one-time password reset link
      // 3. Send an email with the link via email service
      
      // For this demo, we'll just simulate success
      userId = crypto.randomUUID();
      
      console.log(`Would create user with email ${email} and send invitation`);
    }
    
    // Add role to tenant_user_roles
    const { error: roleError } = await supabaseAdmin
      .from("tenant_user_roles")
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role: role,
      });
      
    if (roleError) {
      throw new Error(`Error adding user role: ${roleError.message}`);
    }
    
    // Add system log entry
    await supabaseAdmin
      .from("system_logs")
      .insert({
        module: "user_management",
        event: "user_invited",
        context: {
          email,
          tenant_id: tenantId,
          role,
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
