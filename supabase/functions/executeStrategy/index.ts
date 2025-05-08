
import { corsHeaders, getEnv, validateInput, ExecuteRequest } from "./validation.ts";
import { createErrorResponse, createSuccessResponse, handleExecutionError } from "./errorHandling.ts";
import { executeStrategy } from "./executionCore.ts";

// Main handler function with improved error boundaries
Deno.serve(async (req) => {
  const requestStart = performance.now();
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Request validation with helpful error messages
    if (req.method !== 'POST') {
      return createErrorResponse(
        "Method not allowed", 
        { allowed: ["POST", "OPTIONS"] }, 
        405
      );
    }
    
    // Parse request body with error handling
    let input: ExecuteRequest;
    try {
      input = await req.json();
    } catch (parseError) {
      return createErrorResponse(
        "Invalid JSON in request body", 
        String(parseError), 
        400
      );
    }
    
    // Input validation with detailed errors
    const validation = validateInput(input);
    if (!validation.valid) {
      return createErrorResponse(
        "Invalid input", 
        validation.errors, 
        400
      );
    }
    
    // Get Supabase credentials with error handling
    let SUPABASE_URL = '';
    let SUPABASE_SERVICE_KEY = '';
    
    try {
      SUPABASE_URL = getEnv("SUPABASE_URL");
      SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        throw new Error("Missing required environment variables");
      }
    } catch (envError) {
      console.error("Error getting environment variables:", envError);
      return createErrorResponse(
        "Server configuration error", 
        "Environment variables not properly configured", 
        500
      );
    }
    
    // Create Supabase client with error handling
    let supabase;
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.31.0");
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } catch (clientError) {
      return createErrorResponse(
        "Failed to create database client", 
        String(clientError), 
        500
      );
    }
    
    // Execute the strategy with comprehensive error handling
    const result = await executeStrategy(input, supabase);
    result.request_duration = (performance.now() - requestStart) / 1000;
    
    return createSuccessResponse(result);
    
  } catch (error) {
    return handleExecutionError(error, requestStart);
  }
});
