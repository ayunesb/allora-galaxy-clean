
/**
 * Shared edge function utilities for Supabase Edge Functions
 */

// Export CORS utilities
export {
  corsHeaders,
  handleCorsRequest,
  applyCorsHeaders
} from './cors.ts';

// Export environment utilities
export {
  safeGetEnv,
  getRequiredEnvs,
  isDevelopment,
  isProduction,
  isTest
} from './environment.ts';

// Export validation utilities
export {
  parseAndValidate,
  validateInput,
  schemaBuilders
} from './validation.ts';

// Export response utilities
export {
  createErrorResponse,
  createSuccessResponse,
  handleEdgeError,
  generateRequestId,
  type ErrorResponse,
  type SuccessResponse
} from './response.ts';

// Common logging utility
export async function logSystemEvent(
  supabase: any,
  module: string,
  event: string,
  context: Record<string, any> = {},
  tenantId?: string
): Promise<void> {
  try {
    // Log to console first
    console.log(`[${module}] ${event}${tenantId ? ` (${tenantId})` : ''}: ${JSON.stringify(context)}`);
    
    // Then attempt to log to database if supabase client provided
    if (supabase) {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenantId || 'system',
          module,
          event,
          context,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.warn(`Failed to log system event to database: ${error.message}`);
      }
    }
  } catch (err) {
    // Catch errors but don't let them break the application
    console.error('Error logging system event:', err);
  }
}
