
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { 
  corsHeaders, 
  createErrorResponse, 
  createSuccessResponse, 
  getEnv, 
  handleCorsRequest, 
  logSystemEvent,
  parseJsonBody
} from "../_shared/edgeUtils.ts";

// Environment variables
const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

// Configuration for intelligence processing
const CONFIG = {
  kpiThresholds: {
    mrr_growth: 5, // 5% MRR growth is good
    cac: 1000,    // $1000 CAC is threshold
    active_users: 10 // 10% user growth is good
  },
  analysisWindow: {
    days: 30,     // Analyze 30 days of data
    minSamples: 5 // Need at least 5 data points
  },
  batchSize: 10   // Process 10 tenants at once
};

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Verify required env variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return createErrorResponse(
        "Supabase credentials not configured",
        undefined,
        500
      );
    }
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse request body for optional parameters
    let body;
    let specificTenantId;
    
    try {
      body = await parseJsonBody(req);
      specificTenantId = body.tenant_id;
    } catch {
      // Body parsing failed, that's ok for scheduled runs
    }
    
    // Log start of analysis process
    const requestId = `sched_${Date.now()}`;
    console.log(`[${requestId}] Starting scheduled intelligence analysis`);
    
    // Get tenants to process
    const tenantsQuery = supabase
      .from("tenants")
      .select("id, name")
      .limit(CONFIG.batchSize);
      
    // Filter by specific tenant if provided
    if (specificTenantId) {
      tenantsQuery.eq("id", specificTenantId);
    }
    
    const { data: tenants, error: tenantsError } = await tenantsQuery;
      
    if (tenantsError) {
      console.error("Error fetching tenants:", tenantsError);
      return createErrorResponse(
        "Failed to fetch tenants",
        tenantsError.message,
        500
      );
    }
    
    if (!tenants || tenants.length === 0) {
      return createSuccessResponse({ 
        message: "No tenants found to process",
        tenants_processed: 0
      });
    }
    
    console.log(`Processing ${tenants.length} tenants`);
    
    // Track processing metrics
    let kpisAnalyzed = 0;
    let benchmarksUpdated = 0;
    let agentsEvolved = 0;
    const tenantResults = {};
    
    // Process each tenant
    for (const tenant of tenants) {
      console.log(`Processing tenant: ${tenant.name} (${tenant.id})`);
      tenantResults[tenant.id] = { insights: [] };
      
      try {
        // 1. Analyze KPIs and identify trends
        const kpiTrends = await analyzeKpis(supabase, tenant.id);
        kpisAnalyzed += kpiTrends.length;
        
        // 2. Update benchmarks based on KPI analysis
        if (kpiTrends.length > 0) {
          await updateBenchmarks(supabase, tenant.id, kpiTrends);
          benchmarksUpdated++;
        }
        
        // 3. Check if agents need evolution based on performance
        const { evolved } = await evolveAgentsIfNeeded(supabase, tenant.id);
        agentsEvolved += evolved;
        
        // 4. Log insights from analysis
        await logInsights(supabase, tenant.id, kpiTrends);
        
        // Record tenant processing result
        tenantResults[tenant.id] = {
          name: tenant.name,
          kpis_analyzed: kpiTrends.length,
          insights: kpiTrends.map(t => ({
            name: t.name,
            trend: t.direction,
            significant: t.significant
          })),
          agents_evolved: evolved
        };
        
        // Log successful processing
        await logSystemEvent(
          supabase,
          'system',
          'intelligence_processed',
          {
            kpi_count: kpiTrends.length,
            benchmarks_updated: benchmarksUpdated > 0,
            agents_evolved: evolved
          },
          tenant.id
        );
        
      } catch (tenantError) {
        console.error(`Error processing tenant ${tenant.id}:`, tenantError);
        
        tenantResults[tenant.id].error = String(tenantError);
        
        // Log the error but continue to next tenant
        await logSystemEvent(
          supabase,
          'system',
          'intelligence_error',
          { error: String(tenantError) },
          tenant.id
        );
      }
    }
    
    console.log("Scheduled intelligence processing completed");
    
    // Return processing results
    return createSuccessResponse({
      success: true,
      tenants_processed: tenants.length,
      kpis_analyzed: kpisAnalyzed,
      agents_evolved: agentsEvolved,
      benchmarks_updated: benchmarksUpdated,
      results: tenantResults
    });
    
  } catch (error) {
    console.error("Error in scheduledIntelligence:", error);
    
    return createErrorResponse(
      "Failed to process scheduled intelligence",
      String(error),
      500
    );
  }
});

/**
 * Analyze KPIs for a tenant and identify trends
 */
async function analyzeKpis(supabase, tenantId) {
  const { data: kpis, error } = await supabase
    .from('kpis')
    .select('name, category, value, previous_value, date')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: false })
    .limit(100);
    
  if (error) throw error;
  if (!kpis || kpis.length === 0) return [];
  
  // Group KPIs by name to analyze trends
  const kpiGroups = {};
  kpis.forEach(kpi => {
    if (!kpiGroups[kpi.name]) kpiGroups[kpi.name] = [];
    kpiGroups[kpi.name].push(kpi);
  });
  
  const trends = [];
  
  // Analyze each KPI group
  for (const [name, values] of Object.entries(kpiGroups)) {
    if (values.length < CONFIG.analysisWindow.minSamples) continue;
    
    // Get most recent and historical value
    const current = values[0].value;
    const historical = values[values.length - 1].value;
    
    // Calculate change
    const absoluteChange = current - historical;
    let percentChange = 0;
    
    if (historical !== 0) {
      percentChange = (absoluteChange / Math.abs(historical)) * 100;
    }
    
    // Determine trend direction
    let direction;
    if (Math.abs(percentChange) < 1) {
      direction = 'flat';
    } else if (percentChange > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }
    
    // Check if trend is significant based on thresholds
    let significant = false;
    const category = values[0].category || 'other';
    
    if (name === 'Monthly Recurring Revenue' && Math.abs(percentChange) > CONFIG.kpiThresholds.mrr_growth) {
      significant = true;
    } else if (name === 'Customer Acquisition Cost' && Math.abs(absoluteChange) > CONFIG.kpiThresholds.cac) {
      significant = true;
    } else if (name === 'Active Users' && Math.abs(percentChange) > CONFIG.kpiThresholds.active_users) {
      significant = true;
    }
    
    trends.push({
      name,
      category,
      current,
      historical,
      absoluteChange,
      percentChange,
      direction,
      significant
    });
  }
  
  return trends;
}

/**
 * Update benchmarks based on KPI analysis
 */
async function updateBenchmarks(supabase, tenantId, trends) {
  // In a real implementation, this would update benchmark data
  // For now, log the benchmarks that would be updated
  console.log(`Would update benchmarks for tenant ${tenantId}`);
  return true;
}

/**
 * Trigger agent evolution if needed
 */
async function evolveAgentsIfNeeded(supabase, tenantId) {
  try {
    // Call the autoEvolveAgents function
    const { data, error } = await supabase.functions.invoke('autoEvolveAgents', {
      body: { tenant_id: tenantId }
    });
    
    if (error) {
      console.error(`Error evolving agents for tenant ${tenantId}:`, error);
      return { evolved: 0 };
    }
    
    return { 
      evolved: data.evolved || 0,
      agentIds: data.agentVersionIds || []
    };
  } catch (err) {
    console.error(`Error triggering agent evolution for tenant ${tenantId}:`, err);
    return { evolved: 0 };
  }
}

/**
 * Log insights from KPI analysis
 */
async function logInsights(supabase, tenantId, trends) {
  // Filter for significant trends
  const significantTrends = trends.filter(t => t.significant);
  
  if (significantTrends.length === 0) return;
  
  // Log each significant trend
  for (const trend of significantTrends) {
    await logSystemEvent(
      supabase,
      'kpi',
      `${trend.name.toLowerCase().replace(/\s+/g, '_')}_${trend.direction}`,
      {
        name: trend.name,
        current: trend.current,
        historical: trend.historical,
        change: trend.percentChange,
        category: trend.category
      },
      tenantId
    );
  }
}
