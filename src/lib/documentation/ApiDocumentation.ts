
/**
 * @file API Documentation
 * Comprehensive documentation for the Allora OS API
 */

import { ApiEndpoint } from "@/types/documentation";

/**
 * Complete documentation for all API endpoints in Allora OS
 */
export const apiDocumentation: Record<string, ApiEndpoint[]> = {
  /**
   * Strategy-related API endpoints
   */
  strategies: [
    {
      path: "/api/executeStrategy",
      method: "POST",
      description: "Executes a specified strategy with optional parameters",
      requiresAuth: true,
      requestBody: {
        strategy_id: "UUID of the strategy to execute",
        tenant_id: "UUID of the tenant",
        user_id: "Optional: UUID of the user executing the strategy",
        options: "Optional: Additional execution parameters"
      },
      responseFormat: {
        success: "Boolean indicating success",
        execution_id: "UUID of the execution record",
        strategy_id: "UUID of the executed strategy",
        status: "Execution status (success, partial, failure)",
        plugins_executed: "Number of plugins executed",
        successful_plugins: "Number of successfully executed plugins",
        execution_time: "Execution time in seconds",
        xp_earned: "Experience points earned",
        error: "Error message if execution failed"
      },
      exampleResponse: {
        success: true,
        execution_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        strategy_id: "98e8a7c3-8125-46c5-899e-3f6a75b99292",
        status: "success",
        plugins_executed: 3,
        successful_plugins: 3,
        execution_time: 1.24,
        xp_earned: 30
      },
      errors: [
        { code: 400, message: "Invalid input", reason: "Missing required parameters" },
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" },
        { code: 403, message: "Forbidden", reason: "User does not have permission to execute this strategy" },
        { code: 500, message: "Internal server error", reason: "Unexpected error during execution" }
      ]
    },
    {
      path: "/api/strategies",
      method: "GET",
      description: "Retrieves a list of strategies for the current tenant",
      requiresAuth: true,
      responseFormat: {
        strategies: "Array of strategy objects"
      },
      errors: [
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" },
        { code: 403, message: "Forbidden", reason: "User does not have access to this tenant" }
      ]
    },
    {
      path: "/api/strategies/:id",
      method: "GET",
      description: "Retrieves details of a specific strategy",
      requiresAuth: true,
      responseFormat: {
        id: "UUID of the strategy",
        title: "Strategy title",
        description: "Strategy description",
        status: "Current status",
        created_at: "Creation timestamp",
        updated_at: "Last update timestamp",
        created_by: "UUID of creator",
        tags: "Array of tags",
        completion_percentage: "Percentage complete"
      },
      errors: [
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" },
        { code: 404, message: "Not found", reason: "Strategy not found" }
      ]
    },
    {
      path: "/api/strategies",
      method: "POST",
      description: "Creates a new strategy",
      requiresAuth: true,
      requestBody: {
        title: "Strategy title",
        description: "Strategy description",
        tags: "Optional: Array of tags",
        priority: "Optional: Priority level (low, medium, high)"
      },
      responseFormat: {
        id: "UUID of the created strategy",
        success: "Boolean indicating success"
      },
      errors: [
        { code: 400, message: "Bad request", reason: "Invalid or incomplete data" },
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" }
      ]
    }
  ],

  /**
   * Plugin-related API endpoints
   */
  plugins: [
    {
      path: "/api/plugins",
      method: "GET",
      description: "Retrieves available plugins",
      requiresAuth: true,
      responseFormat: {
        plugins: "Array of plugin objects"
      },
      errors: [
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" }
      ]
    },
    {
      path: "/api/plugins/:id",
      method: "GET",
      description: "Retrieves details of a specific plugin",
      requiresAuth: true,
      responseFormat: {
        id: "UUID of the plugin",
        name: "Plugin name",
        description: "Plugin description",
        status: "Current status",
        xp: "Experience points",
        roi: "Return on investment metric",
        created_at: "Creation timestamp",
        updated_at: "Last update timestamp"
      },
      errors: [
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" },
        { code: 404, message: "Not found", reason: "Plugin not found" }
      ]
    },
    {
      path: "/api/plugins/:id/execute",
      method: "POST",
      description: "Executes a specified plugin with parameters",
      requiresAuth: true,
      requestBody: {
        input: "Plugin-specific input parameters",
        context: "Optional: Execution context"
      },
      responseFormat: {
        success: "Boolean indicating success",
        data: "Result data if successful",
        error: "Error message if execution failed"
      },
      errors: [
        { code: 400, message: "Bad request", reason: "Invalid or incomplete input data" },
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" },
        { code: 404, message: "Not found", reason: "Plugin not found" },
        { code: 500, message: "Internal server error", reason: "Error executing plugin" }
      ]
    }
  ],

  /**
   * Agent-related API endpoints
   */
  agents: [
    {
      path: "/api/agents/versions/:id/vote",
      method: "POST",
      description: "Registers a vote on an agent version",
      requiresAuth: true,
      requestBody: {
        vote_type: "Vote type (up or down)",
        comment: "Optional: Comment explaining the vote"
      },
      responseFormat: {
        success: "Boolean indicating success",
        new_vote_count: "Updated vote count"
      },
      errors: [
        { code: 400, message: "Bad request", reason: "Invalid vote type" },
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" },
        { code: 404, message: "Not found", reason: "Agent version not found" }
      ]
    },
    {
      path: "/api/analyzePromptDiff",
      method: "POST",
      description: "Analyzes differences between two prompts",
      requiresAuth: true,
      requestBody: {
        oldPrompt: "Original prompt text",
        newPrompt: "New prompt text",
        plugin_id: "Optional: Associated plugin ID",
        agent_id: "Optional: Associated agent ID"
      },
      responseFormat: {
        success: "Boolean indicating success",
        analysis: {
          summary: "Array of key changes",
          impact_assessment: "Assessment of potential impact",
          recommendations: "Array of improvement suggestions",
          concerns: "Array of potential concerns"
        }
      },
      errors: [
        { code: 400, message: "Bad request", reason: "Missing prompts to compare" },
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" },
        { code: 500, message: "Internal server error", reason: "Error analyzing prompts" }
      ]
    }
  ],
  
  /**
   * Tenant management API endpoints
   */
  tenants: [
    {
      path: "/api/check-access",
      method: "POST",
      description: "Checks if user has access to a tenant with optional role requirements",
      requiresAuth: true,
      requestBody: {
        tenantId: "UUID of the tenant to check access for",
        requiredRoles: "Optional: Array of roles that would grant access"
      },
      responseFormat: {
        success: "Boolean indicating user has access",
        role: "User's role in the tenant",
        user: {
          id: "User ID",
          email: "User email"
        }
      },
      errors: [
        { code: 400, message: "Bad request", reason: "Missing tenant ID" },
        { code: 401, message: "Unauthorized", reason: "User not authenticated" },
        { code: 403, message: "Forbidden", reason: "User does not have required access" }
      ]
    }
  ],
  
  /**
   * KPI-related API endpoints
   */
  kpis: [
    {
      path: "/api/kpis",
      method: "GET",
      description: "Retrieves KPIs for the current tenant",
      requiresAuth: true,
      responseFormat: {
        kpis: "Array of KPI objects"
      },
      errors: [
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" }
      ]
    },
    {
      path: "/api/updateKPIs",
      method: "POST",
      description: "Updates KPIs from integrated data sources",
      requiresAuth: true,
      requestBody: {
        tenant_id: "UUID of the tenant",
        sources: "Optional: Array of sources to update from"
      },
      responseFormat: {
        success: "Boolean indicating success",
        updated_kpis: "Number of KPIs updated",
        sources_processed: "Array of processed sources"
      },
      errors: [
        { code: 401, message: "Unauthorized", reason: "Missing or invalid authorization" },
        { code: 500, message: "Internal server error", reason: "Error updating KPIs" }
      ]
    }
  ]
};
