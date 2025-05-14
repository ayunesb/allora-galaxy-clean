
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEdgeEnv } from "../../lib/env.ts";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  services: Record<string, {
    status: "healthy" | "degraded" | "unhealthy";
    responseTime?: number;
    message?: string;
  }>;
}

const startTime = Date.now();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = getEdgeEnv("SUPABASE_URL");
    const supabaseServiceKey = getEdgeEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check database connection
    const dbStartTime = Date.now();
    const { error: dbError } = await supabase
      .from("system_logs")
      .select("count", { count: "exact", head: true });
    const dbEndTime = Date.now();
    
    // Check storage service
    const storageStartTime = Date.now();
    const { error: storageError } = await supabase
      .storage
      .listBuckets();
    const storageEndTime = Date.now();
    
    // Prepare response
    const health: HealthResponse = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: getEdgeEnv("NODE_ENV", "production"),
      version: "1.0.0",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      services: {
        database: {
          status: dbError ? "unhealthy" : "healthy",
          responseTime: dbEndTime - dbStartTime,
          message: dbError ? dbError.message : "Connected successfully"
        },
        storage: {
          status: storageError ? "unhealthy" : "healthy",
          responseTime: storageEndTime - storageStartTime,
          message: storageError ? storageError.message : "Connected successfully"
        }
      }
    };
    
    // Set overall status
    if (Object.values(health.services).some(s => s.status === "unhealthy")) {
      health.status = "unhealthy";
    } else if (Object.values(health.services).some(s => s.status === "degraded")) {
      health.status = "degraded";
    }
    
    // Log health check
    await supabase
      .from("system_logs")
      .insert({
        event_type: "health_check",
        status_code: health.status === "healthy" ? 200 : health.status === "degraded" ? 429 : 500,
        message: `Health check: ${health.status}`,
        details: health,
        source: "edge-function"
      });
    
    return new Response(
      JSON.stringify(health),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: health.status === "healthy" ? 200 : health.status === "degraded" ? 429 : 500
      }
    );
  } catch (error) {
    console.error("Health check error:", error);
    
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message,
        environment: getEdgeEnv("NODE_ENV", "production")
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      }
    );
  }
});
