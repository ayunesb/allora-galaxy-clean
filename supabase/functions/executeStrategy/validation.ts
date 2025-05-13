
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { parseAndValidate } from "../_shared/edgeUtils/index.ts";

// Re-export CORS headers
export { corsHeaders } from "../_shared/edgeUtils/cors.ts";

// Define the execute strategy input schema
export const ExecuteStrategySchema = z.object({
  strategy_id: z.string().uuid({
    message: "strategy_id must be a valid UUID",
  }),
  tenant_id: z.string().uuid({
    message: "tenant_id must be a valid UUID",
  }),
  user_id: z.string().uuid({
    message: "user_id must be a valid UUID",
  }).optional(),
  options: z.record(z.any()).optional(),
});

// Define typescript types from schema
export type ExecuteStrategyInput = z.infer<typeof ExecuteStrategySchema>;

/**
 * Validate the execute strategy request input
 * @param req The incoming request
 * @returns Tuple of [validated data, error message]
 */
export async function validateExecuteStrategyRequest(
  req: Request
): Promise<[ExecuteStrategyInput | null, string | null]> {
  return parseAndValidate(req, ExecuteStrategySchema);
}

/**
 * Check if a strategy status is valid for execution
 * @param status The strategy status to check
 * @returns boolean indicating if the strategy can be executed
 */
export function isValidExecutionStatus(status: string): boolean {
  const validStatuses = ['approved', 'pending'];
  return validStatuses.includes(status);
}
