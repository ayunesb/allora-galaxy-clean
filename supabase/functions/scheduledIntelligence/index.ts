
// Scheduled Intelligence Edge Function
// Runs scheduled intelligence tasks for KPI monitoring, campaign auto-launch, and anomaly detection

// Helper function to safely get environment variables with fallbacks
function getEnv(name: string, fallback: string = ""): string {
  try {
    if (typeof Deno !== "undefined" && typeof Deno.env !== "undefined" && Deno.env) {
      return Deno.env.get(name) ?? fallback;
    }
    return process.env[name] || fallback;
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

// Anomaly detection thresholds
const ANOMALY_THRESHOLDS = {
  CAC_INCREASE: 15, // 15% increase in CAC
  CHURN_INCREASE: 10, // 10% increase in churn
  CONVERSION_DROP: 20, // 20% drop in conversion
  MRR_DROP: 5, // 5% drop in MRR
};

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Parse request body
    let input;
    try {
      input = await req.json();
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
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({
        error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Create Supabase client
    let supabase;
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.31.0");
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } catch (clientError) {
      return new Response(JSON.stringify({
        error: "Failed to create Supabase client",
        details: String(clientError)
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Get all active tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, metadata');
    
    if (tenantsError) {
      throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
    }

    const results = [];
    const anomalies = [];

    // Process each tenant
    for (const tenant of tenants || []) {
      try {
        console.log(`Processing tenant: ${tenant.name} (${tenant.id})`);
        
        // 2. Fetch KPIs for the tenant
        const { data: kpis, error: kpisError } = await supabase
          .from('kpis')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('date', { ascending: false })
          .limit(60); // Get last 60 days
        
        if (kpisError) {
          console.error(`Error fetching KPIs for tenant ${tenant.id}:`, kpisError);
          continue;
        }

        // Group KPIs by name
        const kpisByName: Record<string, any[]> = {};
        (kpis || []).forEach(kpi => {
          if (!kpisByName[kpi.name]) {
            kpisByName[kpi.name] = [];
          }
          kpisByName[kpi.name].push(kpi);
        });

        // 3. Analyze KPIs for anomalies
        const tenantAnomalies = detectAnomalies(kpisByName, tenant);
        if (tenantAnomalies.length > 0) {
          anomalies.push(...tenantAnomalies);
          
          // 4. Generate notifications for detected anomalies
          await createAnomalyNotifications(supabase, tenant, tenantAnomalies);
          
          // 5. Log anomaly events to system_logs
          await logAnomalyEvents(supabase, tenant, tenantAnomalies);
        }

        // 6. Check for scheduled campaigns that need to auto-launch
        const campaigns = await checkScheduledCampaigns(supabase, tenant);
        if (campaigns > 0) {
          results.push(`Launched ${campaigns} scheduled campaigns for tenant ${tenant.name}`);
        }

        results.push(`Processed tenant ${tenant.name}: ${tenantAnomalies.length} anomalies detected`);
      } catch (tenantError: any) {
        console.error(`Error processing tenant ${tenant.id}:`, tenantError);
        results.push(`Error processing tenant ${tenant.name}: ${tenantError.message}`);
        
        // Log error in system logs
        try {
          await supabase
            .from('system_logs')
            .insert({
              module: 'system',
              event: 'error',
              context: {
                error: tenantError.message,
                tenant_id: tenant.id,
                function: 'scheduledIntelligence'
              },
              tenant_id: tenant.id
            });
        } catch (logError) {
          console.error("Error logging to system_logs:", logError);
        }
      }
    }

    // Return results
    return new Response(JSON.stringify({
      success: true,
      processed_tenants: tenants?.length || 0,
      anomalies_detected: anomalies.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to run scheduled intelligence",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

// Helper functions

async function createAnomalyNotifications(supabase: any, tenant: any, anomalies: any[]) {
  // Get tenant owner/admins to notify
  const { data: adminUsers, error: usersError } = await supabase
    .from('tenant_user_roles')
    .select('user_id')
    .eq('tenant_id', tenant.id)
    .in('role', ['owner', 'admin']);
  
  if (usersError) {
    console.error(`Error fetching admin users for tenant ${tenant.id}:`, usersError);
    return;
  }

  // Create notifications for each anomaly
  for (const anomaly of anomalies) {
    try {
      // Create notification for each admin user
      for (const { user_id } of adminUsers || []) {
        await supabase
          .from('notifications')
          .insert({
            user_id,
            tenant_id: tenant.id,
            title: `KPI Alert: ${anomaly.metric}`,
            message: anomaly.message,
            type: 'kpi_alert',
            action_url: '/insights/kpis',
            action_label: 'View KPIs',
            metadata: {
              kpi_name: anomaly.kpi_name,
              percentage_change: anomaly.percentage_change,
              current_value: anomaly.current_value,
              previous_value: anomaly.previous_value
            }
          });
      }
    } catch (notifError: any) {
      console.error(`Error creating notification for anomaly in tenant ${tenant.id}:`, notifError);
    }
  }
}

async function logAnomalyEvents(supabase: any, tenant: any, anomalies: any[]) {
  for (const anomaly of anomalies) {
    try {
      await supabase
        .from('system_logs')
        .insert({
          module: 'kpi',
          event: 'warning',
          context: {
            anomaly_type: anomaly.type,
            kpi_name: anomaly.kpi_name,
            message: anomaly.message,
            percentage_change: anomaly.percentage_change,
            current_value: anomaly.current_value,
            previous_value: anomaly.previous_value
          },
          tenant_id: tenant.id
        });
    } catch (logError: any) {
      console.error(`Error logging anomaly event for tenant ${tenant.id}:`, logError);
    }
  }
}

async function checkScheduledCampaigns(supabase: any, tenant: any) {
  try {
    // Get strategies scheduled for today that haven't been executed yet
    const today = new Date().toISOString().split('T')[0];
    const { data: strategies, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('status', 'approved')
      .lt('due_date', new Date().toISOString())
      .eq('auto_execute', true) // Assuming there's an auto_execute flag
      .not('completion_percentage', 'eq', 100);
    
    if (error) {
      console.error(`Error fetching scheduled strategies for tenant ${tenant.id}:`, error);
      return 0;
    }

    let launchedCount = 0;

    // Auto-execute each strategy
    for (const strategy of strategies || []) {
      try {
        // Call the executeStrategy edge function
        const { data: execResult, error: execError } = await supabase.functions.invoke(
          'executeStrategy',
          {
            body: {
              strategy_id: strategy.id,
              tenant_id: tenant.id,
              user_id: 'system',
              options: {
                automatic: true,
                origin: 'scheduled'
              }
            }
          }
        );

        if (execError) {
          console.error(`Error auto-executing strategy ${strategy.id}:`, execError);
          continue;
        }

        // Log successful auto-execution
        await supabase
          .from('system_logs')
          .insert({
            module: 'strategy',
            event: 'info',
            context: {
              action: 'auto_execute',
              strategy_id: strategy.id,
              strategy_name: strategy.title,
              execution_id: execResult.execution_id,
              status: execResult.status
            },
            tenant_id: tenant.id
          });

        launchedCount++;
      } catch (execError: any) {
        console.error(`Error auto-executing strategy ${strategy.id}:`, execError);
      }
    }

    return launchedCount;
  } catch (error: any) {
    console.error(`Error checking scheduled campaigns for tenant ${tenant.id}:`, error);
    return 0;
  }
}

function detectAnomalies(kpisByName: Record<string, any[]>, tenant: any) {
  const anomalies = [];

  for (const [kpiName, kpiValues] of Object.entries(kpisByName)) {
    if (kpiValues.length < 2) continue; // Need at least 2 data points to compare

    // Sort by date, newest first
    kpiValues.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const current = kpiValues[0];
    const previous = kpiValues[1];

    // Skip if either value is missing
    if (current.value === undefined || previous.value === undefined) continue;

    // Calculate percentage change
    const percentageChange = previous.value !== 0 
      ? ((current.value - previous.value) / Math.abs(previous.value)) * 100 
      : 0;

    // Check for anomalies based on KPI name
    switch (kpiName.toLowerCase()) {
      case 'cac':
      case 'customer_acquisition_cost':
        if (percentageChange > ANOMALY_THRESHOLDS.CAC_INCREASE) {
          anomalies.push({
            type: 'cac_increase',
            tenant_id: tenant.id,
            kpi_name: kpiName,
            current_value: current.value,
            previous_value: previous.value,
            percentage_change: percentageChange,
            metric: 'Customer Acquisition Cost',
            message: `Your CAC has spiked by ${percentageChange.toFixed(1)}% compared to the previous period.`
          });
        }
        break;

      case 'churn':
      case 'churn_rate':
        if (percentageChange > ANOMALY_THRESHOLDS.CHURN_INCREASE) {
          anomalies.push({
            type: 'churn_increase',
            tenant_id: tenant.id,
            kpi_name: kpiName,
            current_value: current.value,
            previous_value: previous.value,
            percentage_change: percentageChange,
            metric: 'Churn Rate',
            message: `Your churn rate has increased by ${percentageChange.toFixed(1)}% compared to the previous period.`
          });
        }
        break;

      case 'conversion':
      case 'conversion_rate':
        if (percentageChange < -ANOMALY_THRESHOLDS.CONVERSION_DROP) {
          anomalies.push({
            type: 'conversion_drop',
            tenant_id: tenant.id,
            kpi_name: kpiName,
            current_value: current.value,
            previous_value: previous.value,
            percentage_change: percentageChange,
            metric: 'Conversion Rate',
            message: `Your conversion rate has dropped by ${Math.abs(percentageChange).toFixed(1)}% compared to the previous period.`
          });
        }
        break;

      case 'mrr':
      case 'monthly_recurring_revenue':
        if (percentageChange < -ANOMALY_THRESHOLDS.MRR_DROP) {
          anomalies.push({
            type: 'mrr_drop',
            tenant_id: tenant.id,
            kpi_name: kpiName,
            current_value: current.value,
            previous_value: previous.value,
            percentage_change: percentageChange,
            metric: 'Monthly Recurring Revenue',
            message: `Your MRR has dropped by ${Math.abs(percentageChange).toFixed(1)}% compared to the previous period.`
          });
        }
        break;
    }
  }

  return anomalies;
}
