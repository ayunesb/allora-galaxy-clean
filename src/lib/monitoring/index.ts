
/**
 * Monitoring system for Allora OS
 * Centralizes all monitoring functionality to track application performance and errors
 */

// Re-export all monitoring functionality
export { 
  getMonitoring, 
  setupGlobalErrorHandlers 
} from './setupMonitoring';

export {
  monitorFunction,
  createComponentMonitor
} from './performanceMonitoring';

// Export health check utilities
export { 
  checkSystemHealth,
  generateHealthReport
} from './healthCheck';
