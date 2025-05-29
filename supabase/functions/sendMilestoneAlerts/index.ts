import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MilestoneAlert {
  tenant_id: string;
  user_id?: string;
  title: string;
  message: string;
  achievement_type: 'kpi' | 'strategy' | 'plugin' | 'agent' | 'user';
  achievement_id?: string;
  importance: 'low' | 'medium' | 'high';
  icon?: string;
  action_url?: string;
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body: MilestoneAlert | { type?: string; tenant_id?: string };
    try {
      body = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: String(parseError)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Handle direct milestone alert creation
    if (body.tenant_id && body.title && body.message && body.achievement_type) {
      const milestoneAlert = body as MilestoneAlert;
      
      // Validate the tenant exists
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .select("id")
        .eq("id", milestoneAlert.tenant_id)
        .single();
        
      if (tenantError) {
        return new Response(
          JSON.stringify({ error: "Invalid tenant ID" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create a notification for each relevant user in the tenant
      const { data: tenantUsers, error: usersError } = await supabase
        .from("tenant_user_roles")
        .select("user_id")
        .eq("tenant_id", milestoneAlert.tenant_id);
        
      if (usersError) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch tenant users" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // If a specific user_id is provided, only notify that user
      const usersToNotify = milestoneAlert.user_id 
        ? [{ user_id: milestoneAlert.user_id }]
        : tenantUsers;

      // Create notifications for all users in the tenant
      const notifications = usersToNotify.map(user => ({
        tenant_id: milestoneAlert.tenant_id,
        user_id: user.user_id,
        title: milestoneAlert.title,
        message: milestoneAlert.message,
        type: milestoneAlert.importance === 'high' ? 'alert' : 
              milestoneAlert.importance === 'medium' ? 'warning' : 'info',
        icon: milestoneAlert.icon || (
          milestoneAlert.achievement_type === 'kpi' ? 'trophy' :
          milestoneAlert.achievement_type === 'strategy' ? 'lightbulb' :
          milestoneAlert.achievement_type === 'plugin' ? 'puzzle' :
          milestoneAlert.achievement_type === 'agent' ? 'robot' : 'bell'
        ),
        action_url: milestoneAlert.action_url,
        context: {
          achievement_type: milestoneAlert.achievement_type,
          achievement_id: milestoneAlert.achievement_id,
          importance: milestoneAlert.importance
        }
      }));
      
      // Insert notifications
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notifications);
        
      if (notificationError) {
        return new Response(
          JSON.stringify({ error: "Failed to create notifications", details: notificationError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the milestone alert
      await supabase
        .from("system_logs")
        .insert({
          tenant_id: milestoneAlert.tenant_id,
          module: "notification",
          event: "milestone_alert_created",
          description: milestoneAlert.title,
          context: {
            achievement_type: milestoneAlert.achievement_type,
            achievement_id: milestoneAlert.achievement_id,
            users_notified: usersToNotify.length
          }
        });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Milestone alert sent to ${usersToNotify.length} users`,
          notifications_created: notifications.length
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle system milestone checks (daily CRON, etc.)
    else if (body.type === 'system_check' || body.type === undefined) {
      // Get tenants to process (if tenant_id provided, only process that one)
      const tenantsQuery = supabase.from("tenants").select("id, name");
      
      if (body.tenant_id) {
        tenantsQuery.eq("id", body.tenant_id);
      }
      
      const { data: tenants, error: tenantsError } = await tenantsQuery;
      
      if (tenantsError) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch tenants", details: tenantsError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!tenants || tenants.length === 0) {
        return new Response(
          JSON.stringify({ message: "No tenants to process" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const results: Record<string, any> = {};
      
      // Check for milestones for each tenant
      for (const tenant of tenants) {
        results[tenant.id] = {
          name: tenant.name,
          milestones_detected: 0,
          notifications_sent: 0
        };
        
        // Check for KPI milestones (significant changes)
        try {
          // Get the latest KPI entries
          const { data: latestKpis, error: kpisError } = await supabase
            .from("kpis")
            .select("*, previous_value")
            .eq("tenant_id", tenant.id)
            .order("date", { ascending: false })
            .limit(10);
            
          if (kpisError) {
            console.error(`Error fetching KPIs for tenant ${tenant.name}:`, kpisError);
            continue;
          }
          
          // Check for significant improvements (20%+ increase)
          for (const kpi of latestKpis || []) {
            if (kpi.previous_value && kpi.value > 0 && kpi.previous_value > 0) {
              const percentChange = ((kpi.value - kpi.previous_value) / kpi.previous_value) * 100;
              
              // Significant improvement threshold
              if (percentChange >= 20) {
                // Create milestone alert
                const milestoneAlert: MilestoneAlert = {
                  tenant_id: tenant.id,
                  title: `${kpi.name} has improved by ${Math.round(percentChange)}%!`,
                  message: `${kpi.name} grew from ${kpi.previous_value} to ${kpi.value}, a ${Math.round(percentChange)}% increase.`,
                  achievement_type: 'kpi',
                  achievement_id: `${kpi.name}-${kpi.date}`,
                  importance: percentChange >= 50 ? 'high' : 'medium',
                  action_url: '/insights'
                };
                
                // Notify tenant users
                const { data: tenantUsers } = await supabase
                  .from("tenant_user_roles")
                  .select("user_id")
                  .eq("tenant_id", tenant.id)
                  .in("role", ["owner", "admin"]);
                  
                if (tenantUsers && tenantUsers.length > 0) {
                  // Create notifications
                  const notifications = tenantUsers.map(user => ({
                    tenant_id: tenant.id,
                    user_id: user.user_id,
                    title: milestoneAlert.title,
                    message: milestoneAlert.message,
                    type: milestoneAlert.importance === 'high' ? 'alert' : 'warning',
                    icon: 'trending-up',
                    action_url: milestoneAlert.action_url,
                    context: {
                      achievement_type: 'kpi',
                      kpi_name: kpi.name,
                      percent_change: percentChange
                    }
                  }));
                  
                  await supabase.from("notifications").insert(notifications);
                  
                  results[tenant.id].milestones_detected++;
                  results[tenant.id].notifications_sent += notifications.length;
                }
              }
            }
          }
        } catch (kpiError) {
          console.error(`Error processing KPI milestones for tenant ${tenant.name}:`, kpiError);
        }
        
        // Check for strategy completion milestones
        try {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const { data: completedStrategies, error: strategiesError } = await supabase
            .from("strategies")
            .select("id, title, completion_percentage")
            .eq("tenant_id", tenant.id)
            .eq("status", "completed")
            .gte("updated_at", `${yesterdayStr}T00:00:00`);
            
          if (strategiesError) {
            console.error(`Error fetching completed strategies for tenant ${tenant.name}:`, strategiesError);
            continue;
          }
          
          if (completedStrategies && completedStrategies.length > 0) {
            // Create milestone alert for completed strategies
            const milestoneAlert: MilestoneAlert = {
              tenant_id: tenant.id,
              title: `${completedStrategies.length} Strategies Completed!`,
              message: `${completedStrategies.length} strategies were successfully completed in the last 24 hours.`,
              achievement_type: 'strategy',
              importance: 'medium',
              action_url: '/strategies'
            };
            
            // Notify tenant users
            const { data: tenantUsers } = await supabase
              .from("tenant_user_roles")
              .select("user_id")
              .eq("tenant_id", tenant.id);
              
            if (tenantUsers && tenantUsers.length > 0) {
              // Create notifications
              const notifications = tenantUsers.map(user => ({
                tenant_id: tenant.id,
                user_id: user.user_id,
                title: milestoneAlert.title,
                message: milestoneAlert.message,
                type: 'info',
                icon: 'check-circle',
                action_url: milestoneAlert.action_url,
                context: {
                  achievement_type: 'strategy',
                  strategies: completedStrategies.map(s => ({ id: s.id, title: s.title }))
                }
              }));
              
              await supabase.from("notifications").insert(notifications);
              
              results[tenant.id].milestones_detected++;
              results[tenant.id].notifications_sent += notifications.length;
            }
          }
        } catch (strategyError) {
          console.error(`Error processing strategy milestones for tenant ${tenant.name}:`, strategyError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Milestone check completed for ${tenants.length} tenants`,
          results
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Invalid request
    else {
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error sending milestone alerts:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
