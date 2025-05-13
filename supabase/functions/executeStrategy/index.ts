
// Deno edge function to execute strategies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  handleCorsRequest,
  generateRequestId
} from "../_shared/edgeUtils/index.ts";

import { validateExecuteStrategyRequest, corsHeaders } from "./validation.ts";
import { handleExecutionError } from "./errorHandling.ts";
import { executeStrategy, initializeSupabase } from "./execution.ts";

// Main handler function for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) {
    return corsResponse;
  }
  
  const requestStart = performance.now();
  const requestId = generateRequestId();
  
  try {
    // Parse and validate input
    const [input, validationError] = await validateExecuteStrategyRequest(req);
    
    if (validationError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: validationError 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Create Supabase client
    let supabase;
    try {
      supabase = initializeSupabase();
    } catch (clientError) {
      return new Response(JSON.stringify({ 
        success: false,
        error: clientError.message
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Execute the strategy
    const result = await executeStrategy(input!, supabase, requestStart);
    
    // Add request ID to response
    result.request_id = requestId;
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    // Handle unexpected errors
    return handleExecutionError(error, requestStart);
  }
});
