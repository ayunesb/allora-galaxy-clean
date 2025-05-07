
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

interface MilestoneAlert {
  tenant_id: string;
  tenant_name: string;
  kpi_name: string;
  previous_value: number;
  new_value: number;
  percent_change: number;
  date: string;
  type: 'improvement' | 'warning';
  threshold_crossed?: number;
}

function calculateChangePercent(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request payload for options
    let options = {
      threshold: 15, // Default threshold percentage for significant changes
      notifyUsers: true,
      sendEmails: false,
      specificTenantId: undefined as string | undefined,
      kpiCategories: ['financial', 'marketing', 'sales', 'product'] as string[]
    };
    
    try {
      const body = await req.json();
      options = { ...options, ...body };
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Create Supabase client with service role
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return new Response(
        JSON.stringify({ error: "Supabase environment not configured correctly" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
    // Get all tenants (or the specific one requested)
    const tenantsQuery = supabaseAdmin.from("tenants").select("id, name");
    if (options.specificTenantId) {
      tenantsQuery.eq("id", options.specificTenantId);
    }
    
    const { data: tenants, error: tenantsError } = await tenantsQuery;
      
    if (tenantsError) {
      throw new Error(`Error fetching tenants: ${tenantsError.message}`);
    }
    
    if (!tenants || tenants.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matching tenants found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const alerts: MilestoneAlert[] = [];
    
    // Process each tenant
    for (const tenant of tenants) {
      // Get KPIs with significant changes
      // Get recent KPIs for this tenant
      const { data: recentKpis, error: kpiError } = await supabaseAdmin
        .from("kpis")
        .select("*")
        .eq("tenant_id", tenant.id)
        .in("category", options.kpiCategories)
        .order("date", { ascending: false });
        
      if (kpiError) {
        console.error(`Error finding KPIs for tenant ${tenant.name}:`, kpiError);
        continue;
      }
      
      if (!recentKpis || recentKpis.length === 0) {
        console.log(`No KPI data found for tenant ${tenant.name}`);
        continue;
      }
      
      // Group by metric name to find the most recent and previous values
      const kpiGroups = recentKpis.reduce((acc, kpi) => {
        const key = `${kpi.name}_${kpi.category}_${kpi.source}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(kpi);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Check each group for significant changes
      for (const [key, kpis] of Object.entries(kpiGroups)) {
        if (kpis.length < 2) continue; // Need at least 2 data points
        
        // Sort by date descending (just to be sure)
        kpis.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const current = kpis[0];
        const previous = kpis[1];
        
        const changePercent = calculateChangePercent(previous.value, current.value);
        
        // Check if the change is significant (exceeds threshold)
        if (Math.abs(changePercent) >= options.threshold) {
          // Determine if it's an improvement or warning
          // For most metrics, increase is good; but some like "churn rate" lower is better
          // For this example, we'll use a simple heuristic based on name
          const worseIfHigher = ['churn_rate', 'customer_acquisition_cost', 'expense'].some(term => 
            current.name.toLowerCase().includes(term)
          );
          
          const isImprovement = worseIfHigher ? (changePercent < 0) : (changePercent > 0);
          
          alerts.push({
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            kpi_name: current.name,
            previous_value: previous.value,
            new_value: current.value,
            percent_change: changePercent,
            date: current.date,
            type: isImprovement ? 'improvement' : 'warning',
            threshold_crossed: options.threshold
          });
          
          // Log the system event
          await supabaseAdmin
            .from('system_logs')
            .insert({
              tenant_id: tenant.id,
              module: current.category || 'kpi',
              event: `significant_${isImprovement ? 'improvement' : 'drop'}_in_${current.name}`,
              context: {
                kpi_name: current.name,
                percent_change: changePercent,
                previous_value: previous.value,
                new_value: current.value,
                date: current.date
              }
            });
            
          // Create notifications for tenant users if requested
          if (options.notifyUsers) {
            try {
              // Get tenant users who should receive notifications
              const { data: users } = await supabaseAdmin
                .from("tenant_user_roles")
                .select("user_id")
                .eq("tenant_id", tenant.id)
                .in("role", ["admin", "manager"]);
                
              if (users && users.length > 0) {
                const userIds = users.map(u => u.user_id);
                
                // Create notifications for all relevant users
                await supabaseAdmin
                  .from("notifications")
                  .insert(userIds.map(uid => ({
                    tenant_id: tenant.id,
                    user_id: uid,
                    title: isImprovement 
                      ? `${current.name} improved by ${Math.abs(changePercent).toFixed(1)}%` 
                      : `${current.name} decreased by ${Math.abs(changePercent).toFixed(1)}%`,
                    message: `${current.name} changed from ${previous.value} to ${current.value}`,
                    type: isImprovement ? "success" : "warning",
                    action_url: `/insights/kpis?metric=${encodeURIComponent(current.name)}`
                  })));
              }
            } catch (notifError) {
              console.error(`Error creating notifications for tenant ${tenant.name}:`, notifError);
            }
          }
        }
      }
    }
    
    // Send emails if applicable 
    // (in a real implementation, this would integrate with an email service)
    if (options.sendEmails && alerts.length > 0) {
      console.log(`Would send ${alerts.length} email alerts`);
      
      // Example of what email sending would look like:
      /*
      const emailService = getEnv("EMAIL_SERVICE");
      const emailApiKey = getEnv("EMAIL_API_KEY");
      
      if (emailService && emailApiKey) {
        // Group alerts by tenant
        const alertsByTenant = alerts.reduce((acc, alert) => {
          if (!acc[alert.tenant_id]) {
            acc[alert.tenant_id] = {
              name: alert.tenant_name,
              alerts: []
            };
          }
          acc[alert.tenant_id].alerts.push(alert);
          return acc;
        }, {} as Record<string, {name: string, alerts: MilestoneAlert[]}>);
        
        // For each tenant, send one digest email
        for (const [tenantId, data] of Object.entries(alertsByTenant)) {
          const emailHtml = generateAlertEmailHtml(data.name, data.alerts);
          
          // Send email using your service of choice
          // await sendEmail({
          //   to: "admin@example.com",
          //   subject: `KPI Alerts for ${data.name}`,
          //   html: emailHtml
          // });
        }
      }
      */
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${alerts.length} milestone alerts`,
        alerts_count: alerts.length,
        alerts: alerts.length > 0 ? alerts : null,
        threshold_used: options.threshold
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in sendMilestoneAlerts:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: String(error)
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
