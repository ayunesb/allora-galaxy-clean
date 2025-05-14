
import { ENV } from '../env/envUtils';

/**
 * Interface for monitoring providers
 */
interface MonitoringProvider {
  initialize(): void;
  captureError(error: Error, context?: Record<string, any>): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: Record<string, any>): void;
  startTransaction(name: string, operation: string): Transaction;
}

/**
 * Interface for performance transactions
 */
interface Transaction {
  startSpan(name: string, operation: string): Span;
  finish(status?: string): void;
  setTag(key: string, value: string): void;
}

/**
 * Interface for performance spans
 */
interface Span {
  finish(status?: string): void;
  setTag(key: string, value: string): void;
}

/**
 * Mock implementation for local development
 */
class ConsoleMonitoring implements MonitoringProvider {
  initialize(): void {
    console.log('🔍 Local monitoring initialized');
  }

  captureError(error: Error, context?: Record<string, any>): void {
    console.error('📣 Error captured:', error, context);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: Record<string, any>): void {
    switch (level) {
      case 'info':
        console.info(`📣 [${level}]`, message, context);
        break;
      case 'warning':
        console.warn(`📣 [${level}]`, message, context);
        break;
      case 'error':
        console.error(`📣 [${level}]`, message, context);
        break;
    }
  }

  startTransaction(name: string, operation: string): Transaction {
    console.log(`📊 Transaction started: ${name} (${operation})`);
    const startTime = performance.now();
    
    return {
      startSpan: (spanName: string, spanOperation: string) => {
        console.log(`📊 Span started: ${spanName} (${spanOperation})`);
        const spanStartTime = performance.now();
        
        return {
          finish: (status?: string) => {
            const duration = performance.now() - spanStartTime;
            console.log(`📊 Span finished: ${spanName} (${duration.toFixed(2)}ms)${status ? ` - ${status}` : ''}`);
          },
          setTag: (key: string, value: string) => {
            console.log(`📊 Span tag: ${key}=${value}`);
          }
        };
      },
      finish: (status?: string) => {
        const duration = performance.now() - startTime;
        console.log(`📊 Transaction finished: ${name} (${duration.toFixed(2)}ms)${status ? ` - ${status}` : ''}`);
      },
      setTag: (key: string, value: string) => {
        console.log(`📊 Transaction tag: ${key}=${value}`);
      }
    };
  }
}

// Export monitoring instance based on environment
let monitoring: MonitoringProvider;

// Initialize monitoring based on the current environment
// In a real implementation, this would integrate with Sentry, DataDog, etc.
const initializeMonitoring = (): MonitoringProvider => {
  const environment = ENV('NODE_ENV', 'development');
  
  if (environment === 'production' || environment === 'staging') {
    // Here we would initialize a real monitoring service
    // For now, just use the console implementation
    monitoring = new ConsoleMonitoring();
  } else {
    monitoring = new ConsoleMonitoring();
  }
  
  monitoring.initialize();
  return monitoring;
};

export const getMonitoring = (): MonitoringProvider => {
  if (!monitoring) {
    monitoring = initializeMonitoring();
  }
  return monitoring;
};

// Global error handler
export const setupGlobalErrorHandlers = (): void => {
  const monitor = getMonitoring();
  
  // Handle uncaught exceptions
  window.addEventListener('error', (event) => {
    monitor.captureError(event.error || new Error(event.message), {
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    monitor.captureError(error, {
      type: 'unhandledrejection',
    });
  });
};
