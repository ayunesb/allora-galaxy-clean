
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

/**
 * Interface for agent evolution parameters
 */
export interface AutoEvolveOptions {
  agent_version_id: string;
  tenant_id: string;
  min_xp_threshold?: number;
  min_upvotes?: number;
  notify_users?: boolean;
}

/**
 * Interface for agent evolution result
 */
export interface AutoEvolveResult {
  success: boolean;
  message?: string;
  error?: string;
  evolved?: boolean;
  new_version_id?: string;
  current_version_id?: string;
  requires_approval?: boolean;
  xp_current?: number;
  threshold?: number;
}

/**
 * Checks if an agent version has reached its evolution threshold
 * and evolves it to the next version if available
 * 
 * @param options Evolution parameters
 * @returns Evolution result
 */
export async function checkAndEvolveAgent(
  options: AutoEvolveOptions
): Promise<AutoEvolveResult> {
  try {
    // Input validation with detailed error reporting
    if (!options.agent_version_id) {
      return {
        success: false,
        error: "Agent version ID is required"
      };
    }
    
    if (!options.tenant_id) {
      return {
        success: false,
        error: "Tenant ID is required"
      };
    }
    
    // Set default thresholds
    const xpThreshold = options.min_xp_threshold || 100;
    const upvoteThreshold = options.min_upvotes || 5;
    
    // Get the current agent version with error handling
    const { data: currentVersion, error: versionError } = await supabase
      .from("agent_versions")
      .select("*, plugins(id, name)")
      .eq("id", options.agent_version_id)
      .maybeSingle();
      
    if (versionError || !currentVersion) {
      const errorMessage = versionError?.message || "Agent version not found";
      
      try {
        await logSystemEvent(
          options.tenant_id,
          "agents",
          "agent_version_not_found",
          { 
            agent_version_id: options.agent_version_id,
            error: errorMessage
          }
        );
      } catch (logError) {
        console.error("Failed to log agent version error:", logError);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    // Verify tenant access
    if (currentVersion.tenant_id !== options.tenant_id) {
      const accessError = "Agent version does not belong to the specified tenant";
      
      try {
        await logSystemEvent(
          options.tenant_id,
          "agents",
          "agent_version_access_denied",
          { 
            agent_version_id: options.agent_version_id,
            intended_tenant: options.tenant_id,
            actual_tenant: currentVersion.tenant_id
          }
        );
      } catch (logError) {
        console.error("Failed to log access error:", logError);
      }
      
      return {
        success: false,
        error: accessError
      };
    }
    
    // Check if already deprecated
    if (currentVersion.status === 'deprecated') {
      return {
        success: true,
        message: "Agent version is already deprecated",
        evolved: false,
        current_version_id: options.agent_version_id,
        xp_current: currentVersion.xp || 0,
        threshold: xpThreshold
      };
    }
    
    // Check if XP threshold is met
    if ((currentVersion.xp || 0) < xpThreshold) {
      return {
        success: true,
        message: "Agent version hasn't reached XP threshold yet",
        evolved: false,
        current_version_id: options.agent_version_id,
        xp_current: currentVersion.xp || 0,
        threshold: xpThreshold
      };
    }
    
    // Check if upvote threshold is met
    if ((currentVersion.upvotes || 0) < upvoteThreshold) {
      return {
        success: true,
        message: "Agent version hasn't reached upvote threshold yet",
        evolved: false,
        current_version_id: options.agent_version_id,
        xp_current: currentVersion.xp || 0,
        threshold: xpThreshold
      };
    }
    
    // Check if there is a next version available
    const { data: nextVersions, error: nextError } = await supabase
      .from("agent_versions")
      .select("id, version, status")
      .eq("plugin_id", currentVersion.plugin_id)
      .gt("version", currentVersion.version)
      .order("version", { ascending: true })
      .limit(1);
      
    if (nextError) {
      console.error("Error checking for next version:", nextError);
      // Continue with flagging for human approval
    }
    
    // If no next version exists, flag for human approval
    if (!nextVersions || nextVersions.length === 0) {
      try {
        // Update the current version to indicate it's ready for evolution
        await supabase
          .from("agent_versions")
          .update({ 
            ready_for_evolution: true,
            updated_at: new Date().toISOString()
          })
          .eq("id", options.agent_version_id);
          
        // Log the evolution readiness
        await logSystemEvent(
          options.tenant_id,
          "agents",
          "agent_ready_for_evolution",
          { 
            agent_version_id: options.agent_version_id,
            plugin_id: currentVersion.plugin_id,
            xp: currentVersion.xp,
            upvotes: currentVersion.upvotes
          }
        );
        
        // Create a notification if requested
        if (options.notify_users) {
          try {
            // Get admin users for this tenant
            const { data: admins } = await supabase
              .from("tenant_user_roles")
              .select("user_id")
              .eq("tenant_id", options.tenant_id)
              .in("role", ["admin", "owner"]);
              
            if (admins && admins.length > 0) {
              // Create notifications for all admins
              await supabase
                .from("notifications")
                .insert(admins.map(admin => ({
                  tenant_id: options.tenant_id,
                  user_id: admin.user_id,
                  title: "Agent Ready for Evolution",
                  message: `Agent for "${currentVersion.plugins?.name || 'plugin'}" has reached evolution thresholds and needs approval`,
                  type: "agent_evolution",
                  data: {
                    agent_version_id: options.agent_version_id,
                    plugin_id: currentVersion.plugin_id,
                    xp: currentVersion.xp,
                    upvotes: currentVersion.upvotes
                  }
                })));
            }
          } catch (notifError) {
            console.error("Failed to create notifications:", notifError);
          }
        }
        
        return {
          success: true,
          message: "Agent ready for evolution but needs human approval",
          evolved: false,
          requires_approval: true,
          current_version_id: options.agent_version_id,
          xp_current: currentVersion.xp || 0,
          threshold: xpThreshold
        };
      } catch (error) {
        console.error("Error flagging agent for evolution:", error);
        
        return {
          success: false,
          error: "Failed to flag agent for evolution",
          current_version_id: options.agent_version_id
        };
      }
    }
    
    // Next version exists, perform automatic evolution
    const nextVersion = nextVersions[0];
    
    try {
      // Begin transaction
      // 1. Deprecate current version
      await supabase
        .from("agent_versions")
        .update({ 
          status: "deprecated",
          updated_at: new Date().toISOString()
        })
        .eq("id", options.agent_version_id);
        
      // 2. Activate next version
      await supabase
        .from("agent_versions")
        .update({ 
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", nextVersion.id);
        
      // Log the evolution
      await logSystemEvent(
        options.tenant_id,
        "agents",
        "agent_evolved",
        { 
          previous_version_id: options.agent_version_id,
          new_version_id: nextVersion.id,
          plugin_id: currentVersion.plugin_id,
          xp_at_evolution: currentVersion.xp,
          upvotes_at_evolution: currentVersion.upvotes
        }
      );
      
      // Create a notification if requested
      if (options.notify_users) {
        try {
          // Get users for this tenant
          const { data: users } = await supabase
            .from("tenant_user_roles")
            .select("user_id")
            .eq("tenant_id", options.tenant_id);
            
          if (users && users.length > 0) {
            // Create notifications for all users
            await supabase
              .from("notifications")
              .insert(users.map(user => ({
                tenant_id: options.tenant_id,
                user_id: user.user_id,
                title: "Agent Evolved",
                message: `Agent for "${currentVersion.plugins?.name || 'plugin'}" has evolved to a new version`,
                type: "agent_evolution",
                data: {
                  previous_version_id: options.agent_version_id,
                  new_version_id: nextVersion.id,
                  plugin_id: currentVersion.plugin_id
                }
              })));
          }
        } catch (notifError) {
          console.error("Failed to create notifications:", notifError);
        }
      }
      
      return {
        success: true,
        message: "Agent successfully evolved to next version",
        evolved: true,
        current_version_id: options.agent_version_id,
        new_version_id: nextVersion.id,
        xp_current: currentVersion.xp || 0,
        threshold: xpThreshold
      };
    } catch (error) {
      console.error("Error evolving agent:", error);
      
      try {
        await logSystemEvent(
          options.tenant_id,
          "agents",
          "agent_evolution_failed",
          { 
            agent_version_id: options.agent_version_id,
            intended_new_version_id: nextVersion.id,
            error: error.message || "Unknown error"
          }
        );
      } catch (logError) {
        console.error("Failed to log evolution error:", logError);
      }
      
      return {
        success: false,
        error: "Failed to evolve agent",
        current_version_id: options.agent_version_id
      };
    }
  } catch (error) {
    console.error("Unexpected error in checkAndEvolveAgent:", error);
    
    try {
      await logSystemEvent(
        options.tenant_id,
        "agents",
        "agent_evolution_exception",
        { 
          agent_version_id: options.agent_version_id,
          error: error.message || "Unknown error",
          stack: error.stack
        }
      );
    } catch (logError) {
      console.error("Failed to log evolution exception:", logError);
    }
    
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      current_version_id: options.agent_version_id
    };
  }
}
