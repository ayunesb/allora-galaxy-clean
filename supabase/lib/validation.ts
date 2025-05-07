
import { z } from "https://esm.sh/zod@3.22.4";

/**
 * Standard schema for analyzePromptDiff endpoint
 */
export const analyzePromptDiffSchema = z.object({
  current_prompt: z.string(),
  previous_prompt: z.string(),
  plugin_id: z.string().uuid().optional(),
  agent_version_id: z.string().uuid().optional(),
});

/**
 * Helper to safely parse request body with a zod schema
 */
export async function safeParseRequest<T>(
  req: Request, 
  schema: z.ZodType<T>
): Promise<[T | null, string | null]> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return [null, result.error.message];
    }
    
    return [result.data, null];
  } catch (error) {
    return [null, `Error parsing request: ${error.message || "Invalid JSON"}`];
  }
}

/**
 * Format standard API error response
 */
export function formatErrorResponse(
  status: number = 500,
  message: string,
  details?: any,
  processingTime?: number
): Response {
  const body = {
    success: false,
    error: message,
    details: details || null,
    processing_time: processingTime,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Format standard API success response
 */
export function formatSuccessResponse(
  data: any,
  processingTime?: number,
  status: number = 200
): Response {
  const body = {
    success: true,
    data,
    processing_time: processingTime,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
