
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Common response type for all edge functions
 */
export interface EdgeFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  execution_time?: number;
}

/**
 * Format standard API successful response
 */
export function formatSuccessResponse<T>(
  data: T,
  executionTime?: number
): Response {
  const body: EdgeFunctionResponse<T> = {
    success: true,
    data,
    ...(executionTime !== undefined && { execution_time: executionTime })
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }
  });
}

/**
 * Format standard API error response
 */
export function formatErrorResponse(
  status: number,
  message: string,
  details?: string,
  executionTime?: number
): Response {
  const body: EdgeFunctionResponse = {
    success: false,
    error: message,
    ...(details && { data: { details } }),
    ...(executionTime !== undefined && { execution_time: executionTime })
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }
  });
}

export const uuidSchema = z.string().uuid();

export const executeStrategySchema = z.object({
  strategy_id: uuidSchema,
  tenant_id: uuidSchema,
  user_id: uuidSchema.optional().nullable(),
  options: z.record(z.unknown()).optional().default({})
});

export const updateKPIsSchema = z.object({
  tenant_id: uuidSchema.optional(),
  sources: z.array(z.enum(['stripe', 'ga4', 'hubspot'])).optional(),
  run_mode: z.enum(['cron', 'manual', 'scheduled']).optional().default('cron')
});

export const syncMQLsSchema = z.object({
  tenant_id: uuidSchema.optional(),
  hubspot_api_key: z.string().optional()
});

export const analyzePromptDiffSchema = z.object({
  current_prompt: z.string(),
  previous_prompt: z.string(),
  plugin_id: uuidSchema.optional(),
  agent_version_id: uuidSchema.optional()
});

/**
 * Safely parse the request body using zod schema
 * @param request The incoming request object
 * @param schema The zod schema to validate against
 * @returns A tuple containing [parsed data, error]
 */
export async function safeParseRequest<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<[z.infer<T> | null, string | null]> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (result.success) {
      return [result.data, null];
    } else {
      return [null, `Invalid request: ${result.error.message}`];
    }
  } catch (error) {
    return [null, `Failed to parse request: ${error.message || String(error)}`];
  }
}
