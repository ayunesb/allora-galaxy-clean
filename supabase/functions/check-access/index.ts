import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AccessCheckRequest {
  tenantId: string;
  requiredRoles?: string[];
}

// Import cors headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge function to check access to a tenant, optionally with specific roles
 * This provides a security barrier that can be called from client-side code
 */
serve(async (req: Request) => {
  // Handle CORS preflight options request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    // Get request parameters
    const requestData: AccessCheckRequest = await req.json();
    const { tenantId, requiredRoles } = requestData;
    
    if (!tenantId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameter: tenantId" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Initialize Supabase client using auth header from request
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: "Missing authorization header" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: "User not authenticated" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    // Check if user is a member of the tenant
    const { data: membership, error: membershipError } = await supabaseClient
      .from("tenant_user_roles")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ 
          error: "Forbidden", 
          details: "User is not a member of this tenant" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403 
        }
      );
    }

    // If specific roles are required, check those
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = membership.role;

      // Admin and owner always have access
      const hasAdminAccess = userRole === "admin" || userRole === "owner";

      // Otherwise check if user's role is in the required roles
      const hasRequiredRole = requiredRoles.includes(userRole);

      if (!hasAdminAccess && !hasRequiredRole) {
        return new Response(
          JSON.stringify({ 
            error: "Forbidden", 
            details: "User does not have required role" 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403 
          }
        );
      }
    }

    // User has access
    return new Response(
      JSON.stringify({ 
        success: true, 
        role: membership.role,
        user: {
          id: user.id,
          email: user.email,
        },
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error checking access:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error", 
        details: error.message || String(error)
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
