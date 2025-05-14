
import { getMonitoring } from './setupMonitoring';

/**
 * Performance monitoring utilities
 */

/**
 * Wrap a function with performance monitoring
 * @param name - Name of the operation
 * @param operation - Type of operation being performed
 * @param fn - Function to monitor
 * @returns The wrapped function
 */
export function monitorFunction<T extends (...args: any[]) => Promise<any>>(
  name: string, 
  operation: string, 
  fn: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const monitoring = getMonitoring();
    const transaction = monitoring.startTransaction(name, operation);
    
    try {
      const result = await fn(...args);
      transaction.finish('success');
      return result;
    } catch (error) {
      transaction.setTag('error', 'true');
      transaction.finish('error');
      monitoring.captureError(error instanceof Error ? error : new Error(String(error)), {
        functionName: name,
        operation,
        args: JSON.stringify(args).substring(0, 1000), // Truncate to avoid massive payloads
      });
      throw error;
    }
  }) as T;
}

/**
 * Create a monitoring context for React components
 * @param componentName - Name of the component
 * @returns Context object with monitoring methods
 */
export function createComponentMonitor(componentName: string) {
  const monitoring = getMonitoring();
  
  return {
    logRender: () => {
      monitoring.captureMessage(`Component rendered: ${componentName}`, 'info');
    },
    logError: (error: Error, context?: Record<string, any>) => {
      monitoring.captureError(error, {
        component: componentName,
        ...context
      });
    },
    logEvent: (eventName: string, context?: Record<string, any>) => {
      monitoring.captureMessage(`${componentName}: ${eventName}`, 'info', context);
    },
    measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      const transaction = monitoring.startTransaction(`${componentName}.${name}`, 'component');
      try {
        const result = await fn();
        transaction.finish('success');
        return result;
      } catch (error) {
        transaction.setTag('error', 'true');
        transaction.finish('error');
        throw error;
      }
    }
  };
}
