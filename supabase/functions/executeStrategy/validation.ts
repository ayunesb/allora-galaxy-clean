
import { corsHeaders } from "./errorHandling.ts";

export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

/**
 * Validate and parse the execute strategy request
 * @param req Request object
 * @returns Tuple of [parsed input, error message]
 */
export async function validateExecuteStrategyRequest(
  req: Request
): Promise<[ExecuteStrategyInput | null, string | null]> {
  // Parse request body
  let input: ExecuteStrategyInput;
  try {
    input = await req.json();
  } catch (parseError) {
    return [null, "Invalid JSON in request body"];
  }
  
  // Validate input
  const errors: string[] = [];
  
  if (!input) {
    return [null, "Request body is required"];
  }
  
  if (!input.strategy_id) {
    errors.push("strategy_id is required");
  }
  
  if (!input.tenant_id) {
    errors.push("tenant_id is required");
  }
  
  if (errors.length > 0) {
    return [null, errors.join(", ")];
  }
  
  return [input, null];
}

export { corsHeaders };
