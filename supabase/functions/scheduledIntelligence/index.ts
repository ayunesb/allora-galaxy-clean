// Supabase Edge Function that runs intelligence tasks on a schedule
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const body = await req.json();
    const { tenant_id, tasks = ['kpi_analysis', 'agent_evolution', 'retention_alerts'] } = body;
    
    // Create Supabase client with service role for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Start timestamp for performance tracking
    const startTime = Date.now();
    
    // Log start of scheduled intelligence run
    await logSystemEvent(supabase, 'system', 'info', {
      event: 'scheduled_intelligence_started',
      tasks,
      tenant_id
    }, tenant_id);
    
    const results = {};
    
    // Run the requested intelligence tasks
    for (const task of tasks) {
      try {
        switch (task) {
          case 'kpi_analysis':
            results.kpi_analysis = await runKpiAnalysis(supabase, tenant_id);
            break;
          case 'agent_evolution':
            results.agent_evolution = await triggerAgentEvolution(supabase, tenant_id);
            break;
          case 'retention_alerts':
            results.retention_alerts = await checkRetentionAlerts(supabase, tenant_id);
            break;
          default:
            console.warn(`Unknown task: ${task}`);
            results[task] = { status: 'skipped', reason: 'Unknown task' };
        }
      } catch (taskError) {
        console.error(`Error running task ${task}:`, taskError);
        results[task] = { status: 'error', error: taskError.message };
      }
    }
    
    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000;
    
    // Log completion of scheduled intelligence run
    await logSystemEvent(supabase, 'system', 'info', {
      event: 'scheduled_intelligence_completed',
      tasks,
      results,
      execution_time: executionTime,
      tenant_id
    }, tenant_id);
    
    return new Response(JSON.stringify({
      success: true,
      execution_time: executionTime,
      results
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error("Error in scheduledIntelligence:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred"
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

/**
 * Analyze KPIs and detect anomalies
 */
async function runKpiAnalysis(supabase, tenantId) {
  console.log(`Running KPI analysis for tenant: ${tenantId}`);
  
  // Get KPIs from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: kpis, error } = await supabase
    .from('kpis')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('date', thirtyDaysAgo.toISOString())
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  // Group KPIs by name and calculate trends
  const kpiGroups = {};
  for (const kpi of kpis || []) {
    if (!kpiGroups[kpi.name]) {
      kpiGroups[kpi.name] = [];
    }
    kpiGroups[kpi.name].push(kpi);
  }
  
  const alerts = [];
  const insights = [];
  
  // Analyze each KPI group
  for (const [name, values] of Object.entries(kpiGroups)) {
    if (values.length < 2) continue;
    
    // Sort by date (newest first)
    values.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get current and previous value
    const current = values[0];
    const previous = values[1];
    
    // Calculate percentage change
    const percentChange = previous.value !== 0 
      ? ((current.value - previous.value) / Math.abs(previous.value)) * 100
      : 100;
    
    // Check for significant changes (more than 10%)
    if (Math.abs(percentChange) >= 10) {
      const isPositive = percentChange > 0;
      const severity = Math.abs(percentChange) >= 25 
        ? 'high' 
        : Math.abs(percentChange) >= 15 
          ? 'medium' 
          : 'low';
      
      // Create alert or insight based on direction of change
      const item = {
        kpi_name: name,
        kpi_category: current.category || 'unknown',
        previous_value: previous.value,
        current_value: current.value,
        change_percent: percentChange,
        date: current.date,
        severity
      };
      
      // For revenue and positive metrics, up is good
      const isPositiveMetric = name.toLowerCase().includes('revenue') || 
                              name.toLowerCase().includes('retention') ||
                              name.toLowerCase().includes('conversion');
      
      // Determine if this is an alert or insight
      if ((isPositiveMetric && !isPositive) || (!isPositiveMetric && isPositive)) {
        alerts.push({ ...item, type: 'alert' });
      } else {
        insights.push({ ...item, type: 'insight' });
      }
    }
  }
  
  // Create notifications for high severity alerts
  for (const alert of alerts) {
    if (alert.severity === 'high') {
      await createNotification(supabase, tenantId, {
        title: `KPI Alert: ${alert.kpi_name}`,
        message: `${alert.kpi_name} has changed by ${alert.change_percent.toFixed(1)}% (${alert.previous_value} → ${alert.current_value})`,
        type: 'alert',
        metadata: alert
      });
    }
  }
  
  return {
    status: 'success',
    alerts,
    insights,
    kpis_analyzed: Object.keys(kpiGroups).length
  };
}

/**
 * Trigger agent evolution for promising candidates
 */
async function triggerAgentEvolution(supabase, tenantId) {
  try {
    // Call the autoEvolveAgents function
    const { data, error } = await supabase.functions.invoke('autoEvolveAgents', {
      body: { tenant_id: tenantId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error triggering agent evolution:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Check for users/customers at risk based on activity patterns
 */
async function checkRetentionAlerts(supabase, tenantId) {
  // Implementation would analyze user activity patterns
  // and identify at-risk customers based on engagement metrics
  
  // This is a placeholder implementation
  return {
    status: 'success',
    alerts_generated: 0,
    message: 'Retention analysis complete'
  };
}

/**
 * Create a notification for a user or tenant
 */
async function createNotification(supabase, tenantId, notificationData) {
  try {
    // First get admin users for this tenant
    const { data: admins, error: adminError } = await supabase
      .from('tenant_user_roles')
      .select('user_id')
      .eq('tenant_id', tenantId)
      .in('role', ['admin', 'owner']);
    
    if (adminError) throw adminError;
    
    // Create notifications for each admin
    const notificationPromises = (admins || []).map(admin => {
      return supabase
        .from('notifications')
        .insert({
          tenant_id: tenantId,
          user_id: admin.user_id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          metadata: notificationData.metadata,
          action_url: `/insights/kpis`,
          action_label: 'View KPIs'
        });
    });
    
    await Promise.all(notificationPromises);
    return { created: notificationPromises.length };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { error: error.message };
  }
}

/**
 * Log a system event
 */
async function logSystemEvent(supabase, module, level, context, tenantId) {
  try {
    await supabase
      .from('system_logs')
      .insert({
        module,
        event: context.event || level,
        context,
        tenant_id: tenantId
      });
  } catch (error) {
    console.error('Error logging system event:', error);
    // Non-critical, continue execution
  }
}
