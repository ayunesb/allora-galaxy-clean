
import { corsHeaders } from "./corsHeaders";

/**
 * Generic zod schema type for request validation
 */
export interface Schema {
  parse: (data: any) => any;
  safeParse: (data: any) => { success: boolean; data?: any; error?: any };
}

/**
 * Safely parse a request body with a zod schema
 * @param req The request object
 * @param schema A zod schema for validation
 * @returns A tuple with [parsed data, error message]
 */
export async function safeParseRequest(
  req: Request,
  schema: Schema
): Promise<[any, string | null]> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return [null, "Invalid request format"];
    }
    
    return [result.data, null];
  } catch (error) {
    return [null, "Invalid JSON in request body"];
  }
}

/**
 * Format error response for edge functions
 */
export function formatErrorResponse(
  status: number,
  message: string,
  details?: string,
  executionTime?: number
): Response {
  const body = {
    success: false,
    error: message,
    details: details || null,
    executionTime,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

/**
 * Format success response for edge functions
 */
export function formatSuccessResponse(
  data: Record<string, any>,
  executionTime?: number
): Response {
  const body = {
    success: true,
    ...data,
    executionTime,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

// Schema for analyzing prompt diff params
export const analyzePromptDiffSchema = {
  parse: (data: any) => data,
  safeParse: (data: any) => {
    if (!data) return { success: false, error: "Missing request body" };
    if (!data.current_prompt || !data.previous_prompt) {
      return {
        success: false,
        error: "Both current_prompt and previous_prompt are required"
      };
    }
    return { success: true, data };
  }
};

// Schema for syncing MQLs params
export const syncMQLsSchema = {
  parse: (data: any) => data,
  safeParse: (data: any) => {
    if (!data) return { success: false, error: "Missing request body" };
    if (!data.tenant_id) {
      return { success: false, error: "tenant_id is required" };
    }
    return { success: true, data };
  }
};
