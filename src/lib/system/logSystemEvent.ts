/**
 * Log system events for monitoring and debugging
 * This utility provides consistent logging across the application
 *
 * @param module The module where the event occurred
 * @param level The severity level
 * @param data Event data (must include a description property)
 * @param tenantId Optional tenant ID for multi-tenant environments
 * @returns Promise resolving to the log ID
 *
 * @example
 * ```typescript
 * // Basic info log
 * await logSystemEvent(
 *   'auth',
 *   'info',
 *   { description: 'User logged in successfully' }
 * );
 *
 * // Error log with context data
 * await logSystemEvent(
 *   'api',
 *   'error',
 *   {
 *     description: 'API call failed',
 *     endpoint: '/users',
 *     statusCode: 500,
 *     responseTime: 1250
 *   },
 *   'tenant-123'
 * );
 * ```
 */
export async function logSystemEvent(
  module: string,
  level: "info" | "warning" | "error" | "debug" = "info",
  data: Record<string, unknown> & { description: string },
  tenantId?: string,
): Promise<{ success: boolean; id?: string }> {
  try {
    console.log(`[${level.toUpperCase()}] [${module}]`, data.description, {
      ...data,
      tenantId,
    });

    // In a real implementation, this would insert to the system_logs table
    // For now, just console log and return a mock success response
    return { success: true, id: `log_${Date.now()}` };
  } catch (error) {
    console.error("Error logging system event:", error);
    return { success: false };
  }
}

export default logSystemEvent;

/**
 * Convenience method for logging errors
 *
 * @param module The module where the error occurred
 * @param error The error object or message
 * @param context Additional context data
 * @param tenantId Optional tenant ID
 * @returns Promise resolving to the log result
 *
 * @example
 * ```typescript
 * try {
 *   await saveData();
 * } catch (error) {
 *   await logSystemError(
 *     'data-service',
 *     error,
 *     { operation: 'saveData', recordId: '123' },
 *     'tenant-456'
 *   );
 * }
 * ```
 */
export function logSystemError(
  module: string,
  error: Error | string,
  context?: Record<string, any>,
  tenantId?: string,
): Promise<{ success: boolean; id?: string }> {
  const errorMessage = typeof error === "string" ? error : error.message;
  const errorStack = typeof error === "string" ? undefined : error.stack;

  return logSystemEvent(
    module,
    "error",
    {
      description: errorMessage,
      stack: errorStack,
      ...context,
    },
    tenantId,
  );
}

/**
 * Convenience method for logging info events
 *
 * @param module The module where the event occurred
 * @param description Description of the event
 * @param data Additional event data
 * @param tenantId Optional tenant ID
 * @returns Promise resolving to the log result
 *
 * @example
 * ```typescript
 * await logSystemInfo(
 *   'payment-processor',
 *   'Payment processed successfully',
 *   {
 *     paymentId: 'pay_123',
 *     amount: 99.99,
 *     currency: 'USD'
 *   },
 *   'tenant-789'
 * );
 * ```
 */
export function logSystemInfo(
  module: string,
  description: string,
  data?: Record<string, any>,
  tenantId?: string,
): Promise<{ success: boolean; id?: string }> {
  return logSystemEvent(
    module,
    "info",
    {
      description,
      ...data,
    },
    tenantId,
  );
}
