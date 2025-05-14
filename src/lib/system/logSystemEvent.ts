
/**
 * Log system events for monitoring and debugging
 * @param module The module where the event occurred
 * @param level The severity level
 * @param data Event data
 * @param tenantId Optional tenant ID for multi-tenant environments
 * @returns Promise resolving to the log ID
 */
export async function logSystemEvent(
  module: string,
  level: 'info' | 'warning' | 'error' | 'debug' = 'info',
  data: Record<string, any> & { description: string },
  tenantId?: string
): Promise<{ success: boolean; id?: string }> {
  try {
    console.log(`[${level.toUpperCase()}] [${module}]`, data.description, { ...data, tenantId });
    
    // In a real implementation, this would insert to the system_logs table
    // For now, just console log and return a mock success response
    return { success: true, id: `log_${Date.now()}` };
  } catch (error) {
    console.error('Error logging system event:', error);
    return { success: false };
  }
}

export default logSystemEvent;

/**
 * Convenience method for logging errors
 */
export function logSystemError(
  module: string, 
  error: Error | string,
  context?: Record<string, any>,
  tenantId?: string
): Promise<{ success: boolean; id?: string }> {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;
  
  return logSystemEvent(
    module,
    'error',
    {
      description: errorMessage,
      stack: errorStack,
      ...context
    },
    tenantId
  );
}

/**
 * Convenience method for logging info events
 */
export function logSystemInfo(
  module: string,
  description: string,
  data?: Record<string, any>,
  tenantId?: string
): Promise<{ success: boolean; id?: string }> {
  return logSystemEvent(
    module,
    'info',
    {
      description,
      ...data
    },
    tenantId
  );
}
