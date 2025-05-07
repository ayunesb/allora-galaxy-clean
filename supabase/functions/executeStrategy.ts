
import { serve } from "https://deno.land/std/http/server.ts";
import { runStrategy } from '../../../src/lib/strategy/execute.ts';

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    return typeof Deno !== "undefined" && typeof Deno.env !== "undefined" && Deno.env 
      ? Deno.env.get(name) ?? fallback
      : process.env[name] || fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Track timing for performance logging
  const startTime = performance.now();
  let executionId: string | null = null;
  
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
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
    
    // Validate and extract required parameters with defaults
    const strategy_id = body?.strategy_id || null;
    const tenant_id = body?.tenant_id || null;
    const user_id = body?.user_id || null;
    const options = body?.options || {};
    
    // Validate required parameters
    if (!strategy_id) {
      return new Response(
        JSON.stringify({ error: "Strategy ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: "Tenant ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Execute the strategy
    const result = await runStrategy({
      strategy_id,
      tenant_id,
      user_id,
      options
    });
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: String(error),
        execution_id: executionId
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
