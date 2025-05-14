
/**
 * Shared utilities for edge functions
 */

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

// Safely get environment variables
export function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Generate a unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// Parse JSON safely with error handling
export async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    return await req.json() as T;
  } catch (error) {
    throw new Error(`Invalid JSON request: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Handle CORS preflight requests
export function handleCorsRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Create standardized response formats
export function createSuccessResponse(data: any, message?: string, status: number = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      request_id: generateRequestId(),
    }),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export function createErrorResponse(
  error: string | Error, 
  details?: any, 
  status: number = 500
): Response {
  const errorMessage = error instanceof Error ? error.message : error;

  return new Response(
    JSON.stringify({
      success: false,
      error: errorMessage,
      details,
      timestamp: new Date().toISOString(),
      request_id: generateRequestId(),
    }),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// Helper to implement retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: boolean;
    retryIf?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const { 
    retries = 3, 
    delay = 300, 
    backoff = true, 
    retryIf = () => true,
    onRetry = () => {}
  } = options;
  
  let lastError: any;
  
  for (let attempt = 0; attempt < retries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt >= retries || !retryIf(error)) {
        throw error;
      }
      
      onRetry(attempt + 1, error);
      
      // Calculate delay with exponential backoff if enabled
      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

// Helper for validating inputs
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: string[]
): string[] {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  return missingFields;
}

// Log to system_logs table
export async function logSystemEvent(
  supabase: any,
  module: string,
  event: string,
  context?: Record<string, any>,
  tenantId?: string
): Promise<void> {
  try {
    await supabase.from('system_logs').insert({
      module,
      event,
      context,
      tenant_id: tenantId,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log system event:', error);
  }
}

// Safe wrapper for Supabase operations with retry
export async function safeDbOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  operationName: string
): Promise<T> {
  return withRetry(async () => {
    const { data, error } = await operation();
    
    if (error) {
      console.error(`Error in ${operationName}:`, error);
      throw new Error(`${operationName} failed: ${error.message}`);
    }
    
    return data as T;
  }, {
    retries: 2,
    delay: 500,
    retryIf: (error) => {
      // Only retry on network errors or rate limit errors, not logical errors
      const errorMsg = error?.message?.toLowerCase() || '';
      return errorMsg.includes('network') || 
             errorMsg.includes('timeout') || 
             errorMsg.includes('rate limit') ||
             errorMsg.includes('too many requests');
    }
  });
}
