
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import environment utilities
import { getEnv, validateEnv, type EnvVar } from "../../lib/env.ts";

const MODULE_NAME = "createDbFunctions";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define required environment variables
const requiredEnvs: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' }
];

// Validate environment variables
const env = validateEnv(requiredEnvs);

// Define the database functions
const FUNCTIONS = `
-- Function to safely increment the completion_percentage of a strategy
CREATE OR REPLACE FUNCTION public.increment_percentage(
  current_value int, 
  strategy_id uuid,
  amount int
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_percentage int;
BEGIN
  -- Get the current percentage from the database
  SELECT completion_percentage INTO current_percentage 
  FROM strategies 
  WHERE id = strategy_id;
  
  -- Calculate the new percentage, ensuring it doesn't exceed 100
  RETURN LEAST(100, current_percentage + amount);
END;
$$;

-- Function to check if a user profile exists and create one if not
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (auth.uid())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run the ensure_user_profile function on user login
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
CREATE TRIGGER on_user_login
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_profile();
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`${MODULE_NAME}: Processing request`);

    // Check if Supabase environment variables are valid
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`${MODULE_NAME}: Missing Supabase configuration`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Supabase client could not be initialized",
          details: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Create database functions
    try {
      const { error } = await supabaseAdmin.rpc('pgtle_install_extension_if_not_exists', {
        name: 'pgtle',
        version: '1.0.0'
      });

      if (error) {
        console.error(`${MODULE_NAME}: Error installing pgtle extension:`, error);
      }

      const { error: funcError } = await supabaseAdmin.rpc('run_sql', { sql: FUNCTIONS });

      if (funcError) {
        console.error(`${MODULE_NAME}: Error creating database functions:`, funcError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Error creating database functions",
            details: funcError.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      console.log(`${MODULE_NAME}: Database functions created successfully`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Database functions created successfully"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (error) {
      console.error(`${MODULE_NAME}: Unexpected error:`, error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to create database functions",
          details: String(error)
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error(`${MODULE_NAME}: Unhandled error:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Unhandled error",
        details: String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
