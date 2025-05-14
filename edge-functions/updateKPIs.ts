
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@13.7.0?target=deno";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type KpiCategory = 'financial' | 'marketing' | 'sales' | 'product';
type KpiSource = 'stripe' | 'ga4' | 'hubspot' | 'manual';

interface KpiData {
  tenant_id: string;
  name: string;
  value: number;
  previous_value?: number | null;
  source: KpiSource;
  category: KpiCategory;
  date: string;
}

interface UpdateKPIsRequest {
  tenant_id?: string;
  run_mode?: 'cron' | 'manual';
}

// Constants for retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 500,
  BACKOFF_FACTOR: 2
};

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = "", required: boolean = false): string {
  try {
    // Use type assertion here for Deno environment
    const deno = (globalThis as any).Deno;
    if (deno && typeof deno.env?.get === "function") {
      const value = deno.env.get(name);
      if (value !== undefined) return value;
      if (required) throw new Error(`Required environment variable ${name} is not set`);
    }
    if (required) throw new Error(`Required environment variable ${name} is not available`);
    return fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    if (required) throw err;
    return fallback;
  }
}

/**
 * Execute a function with retry logic
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>, 
  operationName: string
): Promise<T> {
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < RETRY_CONFIG.MAX_RETRIES) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Determine if error is retryable
      const isRetryable = error.message?.includes('network') || 
                          error.message?.includes('timeout') || 
                          error.message?.includes('connection') ||
                          error.status === 503 || 
                          error.status === 429;
      
      if (!isRetryable) {
        console.error(`Non-retryable error for ${operationName}:`, error);
        throw error;
      }
      
      retryCount++;
      
      if (retryCount >= RETRY_CONFIG.MAX_RETRIES) {
        console.error(`Max retries (${RETRY_CONFIG.MAX_RETRIES}) reached for ${operationName}`);
        throw new Error(`Failed after ${RETRY_CONFIG.MAX_RETRIES} attempts: ${error.message}`);
      }
      
      // Calculate backoff delay with jitter
      const baseDelay = RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, retryCount - 1);
      const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
      const delay = Math.floor(baseDelay + jitter);
      
      console.log(`Retrying ${operationName} in ${delay}ms (attempt ${retryCount}/${RETRY_CONFIG.MAX_RETRIES})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error(`Unknown error during ${operationName} execution`);
}

serve(async (req) => {
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = getEnv("SUPABASE_URL", "", true);
    const supabaseServiceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY", "", true);
    const stripeSecretKey = getEnv("STRIPE_SECRET_KEY");
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Supabase credentials not configured",
          execution_time: (performance.now() - startTime) / 1000
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
    // Parse and validate request body
    let specificTenantId: string | undefined;
    let runMode: 'cron' | 'manual' = 'cron';
    
    try {
      const body: UpdateKPIsRequest = await req.json();
      specificTenantId = body.tenant_id;
      if (body.run_mode) runMode = body.run_mode;
    } catch (e) {
      // Body parsing failed, assume it's a scheduled run for all tenants
      console.log("No request body or invalid JSON, assuming scheduled run for all tenants");
    }
    
    // Get tenants to process
    let tenantsQuery = supabaseAdmin.from("tenants").select("id, name, metadata");
    
    // Filter by specific tenant if provided
    if (specificTenantId) {
      tenantsQuery = tenantsQuery.eq("id", specificTenantId);
    }
    
    const { data: tenants, error: tenantsError } = await tenantsQuery;
      
    if (tenantsError) {
      throw new Error(`Error fetching tenants: ${tenantsError.message}`);
    }
    
    if (!tenants || tenants.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "No tenants found to process",
          execution_time: (performance.now() - startTime) / 1000
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Initialize Stripe if we have the key
    let stripe;
    if (stripeSecretKey) {
      try {
        stripe = new Stripe(stripeSecretKey, {
          apiVersion: "2023-10-16",
        });
      } catch (stripeError) {
        console.error("Error initializing Stripe:", stripeError);
      }
    }
    
    const results: Record<string, any> = {};
    
    // Process each tenant
    for (const tenant of tenants) {
      results[tenant.id] = { name: tenant.name, metrics: [] };
      
      // Process financial metrics if Stripe is configured
      if (stripe && tenant.metadata?.stripe_customer_id) {
        try {
          await executeWithRetry(async () => {
            const stripeCustomerId = tenant.metadata.stripe_customer_id;
            
            // In a real implementation, fetch data from Stripe
            // For now, we'll use mock data that changes slightly each run
            const mockMRR = Math.floor(Math.random() * 2000) + 8000 + Math.floor(Math.random() * tenant.id.charCodeAt(0) % 1000);
            
            // Get the previous KPI entry
            const { data: previousKpi } = await supabaseAdmin
              .from("kpis")
              .select("value")
              .eq("tenant_id", tenant.id)
              .eq("name", "Monthly Recurring Revenue")
              .eq("source", "stripe")
              .order("date", { ascending: false })
              .limit(1)
              .maybeSingle();
            
            const currentDate = new Date().toISOString().split('T')[0];
              
            // Create KPI entry
            const kpiData: KpiData = {
              tenant_id: tenant.id,
              name: "Monthly Recurring Revenue",
              value: mockMRR,
              previous_value: previousKpi?.value || null,
              source: "stripe",
              category: "financial",
              date: currentDate,
            };
              
            // Insert new KPI entry
            const { error: insertError } = await supabaseAdmin
              .from("kpis")
              .upsert(kpiData, { 
                onConflict: "tenant_id,name,date",
                ignoreDuplicates: false
              });
              
            if (insertError) {
              throw new Error(`Failed to insert MRR KPI: ${insertError.message}`);
            }
            
            results[tenant.id].metrics.push({
              name: "Monthly Recurring Revenue",
              value: mockMRR,
              previous_value: previousKpi?.value
            });
            
            console.log(`Updated MRR for tenant ${tenant.name}: $${mockMRR}`);
            
            // Also track customer acquisition costs
            const mockCAC = Math.floor(Math.random() * 300) + 200;
            
            await supabaseAdmin
              .from("kpis")
              .upsert({
                tenant_id: tenant.id,
                name: "Customer Acquisition Cost",
                value: mockCAC,
                source: "stripe",
                category: "financial",
                date: currentDate,
              }, { 
                onConflict: "tenant_id,name,date",
                ignoreDuplicates: false
              });
              
            results[tenant.id].metrics.push({
              name: "Customer Acquisition Cost",
              value: mockCAC
            });

            // Log the system event
            await supabaseAdmin
              .from("system_logs")
              .insert({
                tenant_id: tenant.id,
                module: 'billing',
                event: 'kpi_updated',
                context: { kpi_name: 'Financial Metrics', source: 'stripe', run_mode: runMode }
              });
          }, `financial-metrics-${tenant.id}`);
        } catch (error) {
          console.error(`Error updating financial metrics for tenant ${tenant.name}:`, error);
          results[tenant.id].errors = results[tenant.id].errors || [];
          results[tenant.id].errors.push({
            metric: "financial",
            error: String(error)
          });
          
          // Log error to system logs
          try {
            await supabaseAdmin
              .from("system_logs")
              .insert({
                tenant_id: tenant.id,
                module: 'billing',
                event: 'kpi_update_failed',
                context: { 
                  kpi_name: 'Financial Metrics', 
                  source: 'stripe', 
                  run_mode: runMode,
                  error: String(error)
                }
              });
          } catch (logError) {
            console.error('Failed to log error', logError);
          }
        }
      }
      
      // Process product metrics
      try {
        await executeWithRetry(async () => {
          const currentDate = new Date().toISOString().split('T')[0];
          
          // Mock active user count
          const mockActiveUsers = Math.floor(Math.random() * 500) + 100;
          
          // Insert active users metric
          await supabaseAdmin
            .from("kpis")
            .upsert({
              tenant_id: tenant.id,
              name: "Active Users",
              value: mockActiveUsers,
              source: "manual",
              category: "product",
              date: currentDate,
            }, { 
              onConflict: "tenant_id,name,date",
              ignoreDuplicates: false
            });
            
          results[tenant.id].metrics.push({
            name: "Active Users",
            value: mockActiveUsers
          });
          
          // Engagement score (out of 100)
          const mockEngagement = Math.floor(Math.random() * 40) + 60;
          
          await supabaseAdmin
            .from("kpis")
            .upsert({
              tenant_id: tenant.id,
              name: "Engagement Score",
              value: mockEngagement,
              source: "manual",
              category: "product",
              date: currentDate,
            }, { 
              onConflict: "tenant_id,name,date",
              ignoreDuplicates: false
            });
            
          results[tenant.id].metrics.push({
            name: "Engagement Score",
            value: mockEngagement
          });
          
          // Log the system event
          await supabaseAdmin
            .from("system_logs")
            .insert({
              tenant_id: tenant.id,
              module: 'product',
              event: 'kpi_updated',
              context: { kpi_name: 'Product Metrics', run_mode: runMode }
            });
        }, `product-metrics-${tenant.id}`);
      } catch (error) {
        console.error(`Error updating product metrics for tenant ${tenant.name}:`, error);
        results[tenant.id].errors = results[tenant.id].errors || [];
        results[tenant.id].errors.push({
          metric: "product",
          error: String(error)
        });
        
        // Log error to system logs
        try {
          await supabaseAdmin
            .from("system_logs")
            .insert({
              tenant_id: tenant.id,
              module: 'product',
              event: 'kpi_update_failed',
              context: { 
                kpi_name: 'Product Metrics', 
                run_mode: runMode,
                error: String(error)
              }
            });
        } catch (logError) {
          console.error('Failed to log error', logError);
        }
      }
    }
    
    const executionTime = (performance.now() - startTime) / 1000;
    return new Response(
      JSON.stringify({
        success: true,
        message: `KPIs updated for ${tenants.length} tenant(s)`,
        run_mode: runMode,
        execution_time: executionTime,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in updateKPIs:", error);
    
    const executionTime = (performance.now() - startTime) / 1000;
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: String(error),
        execution_time: executionTime
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
