
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Helper function to safely get environment variables with fallbacks
function getEnv(name: string, fallback: string = ""): string {
  try {
    if (typeof Deno !== "undefined" && Deno.env) {
      return Deno.env.get(name) ?? fallback;
    }
    return fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Cors headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduledIntelligenceRequest {
  type: 'daily_run' | 'kpi_monitoring' | 'weekly_benchmark';
  tenants?: string[];
  priority?: 'high' | 'medium' | 'low';
  generate_report?: boolean;
}

async function fetchActiveTenants(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching tenants:", err);
    return [];
  }
}

async function processKPIData(tenantId: string, supabase: any) {
  try {
    console.log(`Processing KPI data for tenant ${tenantId}`);
    
    // Fetch the latest KPI data for this tenant
    const { data: kpis, error: kpiError } = await supabase
      .from('kpis')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })
      .limit(50);
    
    if (kpiError) throw kpiError;
    
    if (!kpis || kpis.length === 0) {
      console.log(`No KPIs found for tenant ${tenantId}`);
      return {
        status: 'no_data',
        kpis_processed: 0,
        alerts: []
      };
    }
    
    // Group KPIs by category
    const kpisByCategory = kpis.reduce((acc, kpi) => {
      if (!acc[kpi.category]) {
        acc[kpi.category] = [];
      }
      acc[kpi.category].push(kpi);
      return acc;
    }, {});
    
    // Look for significant changes or anomalies
    const alerts = [];
    
    for (const category in kpisByCategory) {
      const categoryKpis = kpisByCategory[category];
      
      for (const kpi of categoryKpis) {
        // Skip if there's no previous value to compare
        if (kpi.previous_value === null) continue;
        
        const percentChange = kpi.previous_value !== 0 
          ? ((kpi.value - kpi.previous_value) / Math.abs(kpi.previous_value)) * 100
          : kpi.value > 0 ? 100 : 0;
        
        // Alert on significant changes (more than 20% up or down)
        if (Math.abs(percentChange) >= 20) {
          const changeType = percentChange > 0 ? 'increase' : 'decrease';
          const severity = Math.abs(percentChange) >= 50 ? 'critical' : 'warning';
          
          alerts.push({
            kpi_id: kpi.id,
            kpi_name: kpi.name,
            category: kpi.category,
            previous_value: kpi.previous_value,
            current_value: kpi.value,
            percent_change: percentChange,
            change_type: changeType,
            severity,
            date: kpi.date
          });
        }
      }
    }
    
    // Log alerts to the system_logs table
    for (const alert of alerts) {
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenantId,
          module: 'kpi',
          event: alert.severity === 'critical' ? 'kpi_critical_change' : 'kpi_significant_change',
          context: {
            kpi_id: alert.kpi_id,
            kpi_name: alert.kpi_name,
            category: alert.category,
            previous_value: alert.previous_value,
            current_value: alert.current_value,
            percent_change: alert.percent_change,
            change_type: alert.change_type
          }
        });
    }
    
    return {
      status: 'success',
      kpis_processed: kpis.length,
      alerts
    };
  } catch (err) {
    console.error(`Error processing KPIs for tenant ${tenantId}:`, err);
    return {
      status: 'error',
      error: String(err)
    };
  }
}

async function runAgentEvolution(tenantId: string, supabase: any) {
  try {
    console.log(`Running agent evolution for tenant ${tenantId}`);
    
    // Call the autoEvolveAgents edge function
    const { data, error } = await supabase.functions.invoke("autoEvolveAgents", {
      body: { tenant_id: tenantId },
    });
    
    if (error) throw error;
    
    return {
      status: 'success',
      evolved_agents: data.evolved,
      message: data.message
    };
  } catch (err) {
    console.error(`Error evolving agents for tenant ${tenantId}:`, err);
    return {
      status: 'error',
      error: String(err)
    };
  }
}

async function generateTenantBenchmarks(supabase: any) {
  try {
    console.log("Generating tenant benchmarks");
    
    // Fetch plugin performance stats across all tenants
    const { data: pluginStats, error: pluginError } = await supabase
      .from('plugin_logs')
      .select(`
        plugin_id,
        tenant_id,
        count(*) as execution_count,
        avg(execution_time) as avg_execution_time,
        sum(case when status = 'success' then 1 else 0 end)::float / count(*) as success_rate
      `)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .group('tenant_id, plugin_id');
    
    if (pluginError) throw pluginError;
    
    // Fetch KPI trends across all tenants
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpis')
      .select('*')
      .order('date', { ascending: false })
      .limit(500);
    
    if (kpiError) throw kpiError;
    
    // Group by tenant and compute benchmark metrics
    const tenantBenchmarks = {};
    
    // Process plugin stats
    pluginStats.forEach(stat => {
      if (!tenantBenchmarks[stat.tenant_id]) {
        tenantBenchmarks[stat.tenant_id] = {
          plugins: {},
          kpis: {},
          overall_performance: {
            plugin_execution_count: 0,
            avg_success_rate: 0,
            avg_execution_time: 0
          }
        };
      }
      
      tenantBenchmarks[stat.tenant_id].plugins[stat.plugin_id] = {
        execution_count: stat.execution_count,
        avg_execution_time: stat.avg_execution_time,
        success_rate: stat.success_rate
      };
      
      tenantBenchmarks[stat.tenant_id].overall_performance.plugin_execution_count += stat.execution_count;
    });
    
    // Process KPI data
    kpiData.forEach(kpi => {
      if (!tenantBenchmarks[kpi.tenant_id]) {
        tenantBenchmarks[kpi.tenant_id] = {
          plugins: {},
          kpis: {},
          overall_performance: {
            plugin_execution_count: 0,
            avg_success_rate: 0,
            avg_execution_time: 0
          }
        };
      }
      
      if (!tenantBenchmarks[kpi.tenant_id].kpis[kpi.name]) {
        tenantBenchmarks[kpi.tenant_id].kpis[kpi.name] = {
          current_value: kpi.value,
          category: kpi.category,
          unit: kpi.unit,
          date: kpi.date
        };
      }
    });
    
    // Calculate overall metrics for each tenant
    Object.keys(tenantBenchmarks).forEach(tenantId => {
      const tenant = tenantBenchmarks[tenantId];
      const pluginCount = Object.keys(tenant.plugins).length;
      
      if (pluginCount > 0) {
        let totalSuccessRate = 0;
        let totalExecutionTime = 0;
        
        Object.values(tenant.plugins).forEach((plugin: any) => {
          totalSuccessRate += plugin.success_rate;
          totalExecutionTime += plugin.avg_execution_time;
        });
        
        tenant.overall_performance.avg_success_rate = totalSuccessRate / pluginCount;
        tenant.overall_performance.avg_execution_time = totalExecutionTime / pluginCount;
      }
    });
    
    // Store benchmark results in the system_logs table for historical tracking
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: 'system', // Special tenant_id to indicate system-wide data
        module: 'system',
        event: 'tenant_benchmark_generated',
        context: {
          benchmark_date: new Date().toISOString(),
          tenant_count: Object.keys(tenantBenchmarks).length,
          benchmarks: tenantBenchmarks
        }
      });
    
    return {
      status: 'success',
      tenant_count: Object.keys(tenantBenchmarks).length,
      benchmarks: tenantBenchmarks
    };
  } catch (err) {
    console.error("Error generating tenant benchmarks:", err);
    return {
      status: 'error',
      error: String(err)
    };
  }
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Parse request body
    let requestData: ScheduledIntelligenceRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body", 
        details: String(parseError) 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Get Supabase credentials
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ 
        error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured" 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Create Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.31.0");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const results = {
      type: requestData.type,
      timestamp: new Date().toISOString(),
      tenant_results: [],
      benchmark_results: null,
      errors: []
    };
    
    // Determine which tenants to process
    let tenants = [];
    
    if (requestData.tenants && requestData.tenants.length > 0) {
      tenants = requestData.tenants;
    } else {
      // Fetch all active tenants
      tenants = await fetchActiveTenants(supabase);
      tenants = tenants.map(t => t.id);
    }
    
    console.log(`Processing ${tenants.length} tenants for ${requestData.type} task`);
    
    // Process each tenant based on task type
    if (requestData.type === 'daily_run' || requestData.type === 'kpi_monitoring') {
      for (const tenantId of tenants) {
        try {
          // Process KPI data
          const kpiResult = await processKPIData(tenantId, supabase);
          
          // Run agent evolution if doing a daily run
          let evolutionResult = null;
          if (requestData.type === 'daily_run') {
            evolutionResult = await runAgentEvolution(tenantId, supabase);
          }
          
          results.tenant_results.push({
            tenant_id: tenantId,
            kpi_result: kpiResult,
            evolution_result: evolutionResult
          });
        } catch (err) {
          console.error(`Error processing tenant ${tenantId}:`, err);
          results.errors.push({
            tenant_id: tenantId,
            error: String(err)
          });
        }
      }
    }
    
    // Generate benchmark report if requested
    if (requestData.type === 'weekly_benchmark' && requestData.generate_report) {
      try {
        const benchmarkResults = await generateTenantBenchmarks(supabase);
        results.benchmark_results = benchmarkResults;
      } catch (err) {
        console.error("Error generating benchmarks:", err);
        results.errors.push({
          error: String(err),
          context: "benchmark_generation"
        });
      }
    }
    
    // Log summary to system_logs
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: 'system',
        module: 'system',
        event: `${requestData.type}_completed`,
        context: {
          tenants_processed: tenants.length,
          success_count: tenants.length - results.errors.length,
          error_count: results.errors.length,
          timestamp: results.timestamp
        }
      });
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Failed to process scheduled intelligence task", 
      details: String(error) 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
