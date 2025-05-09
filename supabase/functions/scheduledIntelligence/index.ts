
// Supabase Edge Function for scheduled intelligence tasks
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Intelligence tasks configuration
const CONFIG = {
  enableKpiAnalysis: true,
  enableAgentEvolution: true,
  enableAlerts: true,
  tenantBenchmarkFrequency: 'weekly', // daily, weekly, monthly
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting scheduled intelligence tasks");
    
    const startTime = Date.now();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse request body to get specific tasks to run
    let requestBody = {};
    let specificTenantId = null;
    
    try {
      requestBody = await req.json();
      specificTenantId = requestBody.tenant_id;
    } catch (e) {
      // No body or invalid JSON - run for all tenants
    }
    
    // Get active tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name')
      .order('created_at', { ascending: false });
      
    if (tenantsError) {
      throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
    }
    
    console.log(`Found ${tenants.length} tenants to process`);
    
    // Filter to specific tenant if requested
    const tenantsToProcess = specificTenantId
      ? tenants.filter(t => t.id === specificTenantId)
      : tenants;
      
    // Results tracking
    const results = {
      tenants_processed: 0,
      kpis_analyzed: 0,
      agents_evolved: 0,
      alerts_sent: 0,
      benchmarks_updated: 0,
      errors: []
    };
    
    // Process each tenant
    for (const tenant of tenantsToProcess) {
      try {
        console.log(`Processing tenant: ${tenant.name} (${tenant.id})`);
        
        // 1. KPI Analysis - detect trends and anomalies
        if (CONFIG.enableKpiAnalysis) {
          const kpiResults = await analyzeKpis(supabase, tenant.id);
          results.kpis_analyzed += kpiResults.analyzed || 0;
        }
        
        // 2. Agent Evolution - evolve agents based on performance
        if (CONFIG.enableAgentEvolution) {
          const agentResults = await triggerAgentEvolution(supabase, tenant.id);
          results.agents_evolved += agentResults.evolved || 0;
        }
        
        // 3. Create tenant benchmarks for comparison
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        const dayOfMonth = now.getDate();
        
        // Weekly benchmarks on Mondays (day 1)
        if (CONFIG.tenantBenchmarkFrequency === 'weekly' && dayOfWeek === 1) {
          await createTenantBenchmarks(supabase, tenant.id);
          results.benchmarks_updated++;
        }
        // Monthly benchmarks on the 1st
        else if (CONFIG.tenantBenchmarkFrequency === 'monthly' && dayOfMonth === 1) {
          await createTenantBenchmarks(supabase, tenant.id);
          results.benchmarks_updated++;
        }
        // Daily benchmarks every day
        else if (CONFIG.tenantBenchmarkFrequency === 'daily') {
          await createTenantBenchmarks(supabase, tenant.id);
          results.benchmarks_updated++;
        }
        
        // Mark tenant as processed
        results.tenants_processed++;
        
      } catch (tenantError) {
        console.error(`Error processing tenant ${tenant.id}:`, tenantError);
        results.errors.push({
          tenant_id: tenant.id,
          error: tenantError.message || "Unknown error"
        });
      }
    }
    
    // Log completion
    const duration = Date.now() - startTime;
    console.log(`Scheduled intelligence tasks completed in ${duration}ms`);
    
    // Record execution in system_logs
    await supabase
      .from('system_logs')
      .insert({
        module: 'system',
        event: 'scheduled_intelligence_completed',
        context: {
          ...results,
          duration_ms: duration,
          timestamp: new Date().toISOString()
        }
      });
    
    // Return results
    return new Response(JSON.stringify({
      success: true,
      ...results,
      duration_ms: duration
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error("Error in scheduledIntelligence:", error);
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});

// Helper functions

// Analyze KPIs to detect trends and anomalies
async function analyzeKpis(supabase, tenantId) {
  console.log(`Analyzing KPIs for tenant ${tenantId}`);
  
  try {
    // Get recent KPIs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: kpis, error: kpisError } = await supabase
      .from('kpis')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', thirtyDaysAgo.toISOString());
      
    if (kpisError) throw kpisError;
    
    console.log(`Found ${kpis?.length || 0} KPIs to analyze`);
    
    // Group KPIs by name
    const kpiGroups = {};
    kpis.forEach(kpi => {
      if (!kpiGroups[kpi.name]) {
        kpiGroups[kpi.name] = [];
      }
      kpiGroups[kpi.name].push(kpi);
    });
    
    // Analyze each KPI group
    let anomaliesDetected = 0;
    
    for (const [kpiName, kpiValues] of Object.entries(kpiGroups)) {
      // Sort by date ascending
      const sortedValues = kpiValues.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      if (sortedValues.length >= 3) {
        // Simple anomaly detection (comparing recent value to average)
        const recentValue = sortedValues[sortedValues.length - 1].value;
        const previousValues = sortedValues.slice(0, -1).map(k => k.value);
        const average = previousValues.reduce((sum, val) => sum + val, 0) / previousValues.length;
        const stdDev = calculateStdDev(previousValues, average);
        
        // If value is more than 2 standard deviations away from mean, flag as anomaly
        if (Math.abs(recentValue - average) > 2 * stdDev) {
          console.log(`Anomaly detected in KPI ${kpiName}: ${recentValue} (avg: ${average.toFixed(2)}, stdDev: ${stdDev.toFixed(2)})`);
          
          // Log anomaly
          await supabase
            .from('system_logs')
            .insert({
              module: 'kpi',
              event: 'anomaly_detected',
              tenant_id: tenantId,
              context: {
                kpi_name: kpiName,
                value: recentValue,
                average: average,
                std_dev: stdDev,
                date: sortedValues[sortedValues.length - 1].date
              }
            });
          
          anomaliesDetected++;
        }
      }
    }
    
    return {
      analyzed: kpis?.length || 0,
      anomalies: anomaliesDetected
    };
    
  } catch (error) {
    console.error('Error analyzing KPIs:', error);
    return { analyzed: 0, anomalies: 0 };
  }
}

// Trigger agent evolution for a tenant
async function triggerAgentEvolution(supabase, tenantId) {
  try {
    // Call the autoEvolveAgents function via internal Supabase function call
    const { data: result, error } = await supabase.functions.invoke('autoEvolveAgents', {
      body: { tenant_id: tenantId }
    });
    
    if (error) throw error;
    
    return { 
      evolved: result.evolved || 0,
      success: true
    };
  } catch (error) {
    console.error('Error triggering agent evolution:', error);
    return { evolved: 0, success: false };
  }
}

// Create benchmarks for tenant comparison
async function createTenantBenchmarks(supabase, tenantId) {
  try {
    console.log(`Creating benchmarks for tenant ${tenantId}`);
    
    // 1. Get KPI totals/averages
    const { data: kpiStats, error: kpiError } = await supabase
      .from('kpis')
      .select('name, category, value')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1000);
      
    if (kpiError) throw kpiError;
    
    // Calculate averages by category and name
    const kpiAverages = {};
    const categoryAverages = {};
    
    kpiStats.forEach(kpi => {
      // Add to KPI-specific average
      if (!kpiAverages[kpi.name]) {
        kpiAverages[kpi.name] = { sum: 0, count: 0 };
      }
      kpiAverages[kpi.name].sum += kpi.value;
      kpiAverages[kpi.name].count++;
      
      // Add to category average
      if (kpi.category) {
        if (!categoryAverages[kpi.category]) {
          categoryAverages[kpi.category] = { sum: 0, count: 0 };
        }
        categoryAverages[kpi.category].sum += kpi.value;
        categoryAverages[kpi.category].count++;
      }
    });
    
    // 2. Create or update benchmark records
    for (const [kpiName, stats] of Object.entries(kpiAverages)) {
      const avgValue = stats.count > 0 ? stats.sum / stats.count : 0;
      
      // Get matching KPI record to determine category
      const matchingKpi = kpiStats.find(k => k.name === kpiName);
      const category = matchingKpi?.category || 'unknown';
      
      // Insert benchmark record
      await supabase
        .from('tenant_benchmarks')
        .upsert({
          tenant_id: tenantId,
          metric_name: kpiName,
          metric_category: category,
          value: avgValue,
          updated_at: new Date().toISOString()
        }, { onConflict: 'tenant_id,metric_name' });
    }
    
    return { created: Object.keys(kpiAverages).length };
    
  } catch (error) {
    console.error('Error creating tenant benchmarks:', error);
    return { created: 0 };
  }
}

// Helper function to calculate standard deviation
function calculateStdDev(values, mean) {
  if (values.length <= 1) return 0;
  
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}
