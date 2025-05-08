/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    // Use a more TypeScript-friendly approach to check for Deno environment
    const isDeno = typeof globalThis !== "undefined" && 
                  "Deno" in globalThis && 
                  typeof globalThis.Deno !== "undefined" && 
                  "env" in globalThis.Deno;
                  
    if (isDeno) {
      return (globalThis.Deno as any).env.get(name) ?? fallback;
    }
    
    return process.env[name] || fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Safely access Deno environment in edge functions
 */
function safeGetDenoEnv(name: string): string | undefined {
  try {
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof globalThis.Deno?.env?.get === 'function') {
      return globalThis.Deno.env.get(name);
    }
  } catch (e) {
    console.error(`Error accessing Deno env: ${e}`);
  }
  return undefined;
}

/**
 * Validate strategy execution input
 * @param input The input to validate
 * @returns Validation result
 */
export function validateInput(input: any): ValidationResult {
  const errors: string[] = [];
  
  if (!input) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }
  
  if (!input.strategy_id) {
    errors.push("strategy_id is required");
  }
  
  if (!input.tenant_id) {
    errors.push("tenant_id is required");
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Create a Supabase admin client with service role
 * @returns Supabase client instance or null if environment variables are missing
 */
export function createSupabaseAdmin() {
  // Get environment variables from either Deno or process
  const supabaseUrl = safeGetDenoEnv("SUPABASE_URL") || 
                      (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined);
                      
  const supabaseServiceKey = safeGetDenoEnv("SUPABASE_SERVICE_ROLE_KEY") || 
                             (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Interface for strategy execution input
 */
export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

/**
 * Interface for strategy execution result
 */
export interface ExecuteStrategyResult {
  success: boolean;
  strategy_id?: string;
  message?: string;
  error?: string;
  data?: any;
  execution_id?: string;
  execution_time?: number;
}

/**
 * Executes a strategy with comprehensive error handling
 * @param input The strategy execution input parameters
 * @returns The execution result
 */
export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  
  try {
    // Input validation with detailed error messages
    if (!input) {
      return {
        success: false,
        error: "Input parameters are required",
        execution_time: performance.now() - startTime
      };
    }

    if (!input.strategy_id) {
      return { 
        success: false, 
        error: "Strategy ID is required",
        execution_time: performance.now() - startTime
      };
    }

    if (!input.tenant_id) {
      return { 
        success: false, 
        error: "Tenant ID is required",
        execution_time: performance.now() - startTime
      };
    }
    
    // In a real implementation, record execution and run strategy
    // Here we're simulating successful execution
    console.log(`Executing strategy ${input.strategy_id} for tenant ${input.tenant_id}`);

    const executionTime = performance.now() - startTime;
    
    // Return success with execution metrics
    return {
      success: true,
      strategy_id: input.strategy_id,
      message: 'Strategy executed successfully',
      execution_time: executionTime,
      execution_id: `exec_${Date.now()}`
    };
  } catch (error: any) {
    const executionTime = performance.now() - startTime;
    console.error("Error executing strategy:", error);
    
    // Return detailed error with execution metrics
    return {
      success: false,
      error: error.message || 'An unknown error occurred while executing the strategy',
      execution_time: executionTime
    };
  }
}

/**
 * Function to validate strategy parameters
 */
export function validateStrategyParameters(params: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Define required parameters
  const requiredParams = ['name', 'description'];
  
  // Check if all required parameters are provided
  for (const param of requiredParams) {
    if (!params[param]) {
      errors.push(`Missing required parameter: ${param}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Function to track execution metrics
 */
export async function trackExecutionMetrics(
  tenant_id: string, 
  strategy_id: string, 
  execution_id: string,
  metrics: {
    execution_time: number;
    success: boolean;
    error?: string;
  }
): Promise<void> {
  try {
    // In a real implementation, this would send metrics to a monitoring system
    console.log(`Tracking metrics for execution ${execution_id}:`, metrics);
  } catch (error) {
    console.error("Failed to track execution metrics:", error);
  }
}

/**
 * Function to notify stakeholders about strategy execution
 */
export async function notifyStakeholders(
  tenant_id: string,
  strategy_id: string,
  execution_id: string,
  result: ExecuteStrategyResult
): Promise<void> {
  try {
    // In a real implementation, this would send notifications
    console.log(`Notifying stakeholders about execution ${execution_id}:`, result);
  } catch (error) {
    console.error("Failed to notify stakeholders:", error);
  }
}
