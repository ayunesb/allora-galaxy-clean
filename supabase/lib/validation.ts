/**
 * Validation utilities for edge functions
 */

import { corsHeaders } from "./utils.ts";

// Export a basic schema for syncMQLs request
export const syncMQLsSchema = {
  safeParse: (data: any) => {
    // Basic validation
    const errors: string[] = [];
    
    if (!data.tenant_id) {
      errors.push("tenant_id is required");
    }
    
    if (errors.length > 0) {
      return {
        success: false,
        error: { issues: errors.map(e => ({ path: [], message: e })) }
      };
    }
    
    return {
      success: true,
      data
    };
  }
};

/**
 * Create a standardized error response
 * @param status HTTP status code
 * @param message Error message
 * @param details Error details
 * @param executionTime Execution time in seconds
 * @returns Response object
 */
export function formatErrorResponse(
  status: number,
  message: string,
  details?: string,
  executionTime: number = 0
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details,
      execution_time: executionTime
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

/**
 * Create a standardized success response
 * @param data Response data
 * @param executionTime Execution time in seconds
 * @returns Response object
 */
export function formatSuccessResponse(data: any, executionTime: number = 0): Response {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
      execution_time: executionTime
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
