
/**
 * Edge function utilities
 */

// CORS headers for all edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Create a standardized error response
 * @param status HTTP status code
 * @param message Error message
 * @param details Optional error details
 * @param executionTime Optional execution time in seconds
 * @returns Response object
 */
export function createErrorResponse(
  status: number, 
  message: string, 
  details?: string, 
  startTime?: number
): Response {
  const executionTime = startTime ? (performance.now() - startTime) / 1000 : 0;
  
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
 * @param startTime Optional start time for calculating execution time
 * @returns Response object
 */
export function formatResponse(data: any, startTime?: number): Response {
  const executionTime = startTime ? (performance.now() - startTime) / 1000 : 0;
  
  return new Response(
    JSON.stringify({
      ...data,
      execution_time: executionTime
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Parse and validate request body
 * @param req Request object
 * @param schema Zod schema for validation
 * @returns Tuple of [parsed data, error message]
 */
export async function safeParseRequest(req: Request, schema: any): Promise<[any, string | null]> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const formattedErrors = result.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return [null, `Validation error: ${formattedErrors}`];
    }
    
    return [result.data, null];
  } catch (error) {
    return [null, `Request parsing error: ${error}`];
  }
}

/**
 * Generate a unique request ID
 * @returns Unique request ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Handle CORS preflight requests
 * @param req Request object
 * @returns Response if preflight, null otherwise
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}
