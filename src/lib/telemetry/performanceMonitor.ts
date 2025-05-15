
/**
 * Helper utility for tracking and reporting application performance metrics
 */
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Define performance measurement types
export type PerformanceMetricName = 
  | 'page-load'
  | 'component-render'
  | 'data-fetch'
  | 'edge-function'
  | 'ui-interaction'
  | 'resource-load';

interface PerformanceMeasurement {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceReportOptions {
  module?: string;
  context?: Record<string, any>;
  userId?: string;
  tenantId?: string;
}

// Store active measurements
const activeMeasurements = new Map<string, PerformanceMeasurement>();

/**
 * Start a performance measurement
 * 
 * @param type Type of performance metric
 * @param name Specific name for this measurement
 * @param metadata Additional contextual data
 * @returns Unique ID for this measurement
 */
export function startMeasurement(
  type: PerformanceMetricName,
  name: string,
  metadata: Record<string, any> = {}
): string {
  const id = `${type}_${name}_${Date.now()}`;
  
  activeMeasurements.set(id, {
    name: `${type}:${name}`,
    startTime: performance.now(),
    metadata
  });
  
  return id;
}

/**
 * End a performance measurement and report it
 * 
 * @param id The measurement ID returned from startMeasurement
 * @param additionalMetadata Additional metadata to include in report
 * @param options Reporting options
 * @returns The measurement duration in milliseconds
 */
export function endMeasurement(
  id: string,
  additionalMetadata: Record<string, any> = {},
  options: PerformanceReportOptions = {}
): number | null {
  const measurement = activeMeasurements.get(id);
  
  if (!measurement) {
    console.warn(`Performance measurement ${id} not found`);
    return null;
  }
  
  // Calculate duration
  measurement.endTime = performance.now();
  measurement.duration = measurement.endTime - measurement.startTime;
  
  // Merge metadata
  measurement.metadata = {
    ...measurement.metadata,
    ...additionalMetadata
  };
  
  // Report the measurement
  reportPerformanceMeasurement(measurement, options);
  
  // Clean up
  activeMeasurements.delete(id);
  
  return measurement.duration;
}

/**
 * Report a performance measurement to telemetry
 */
async function reportPerformanceMeasurement(
  measurement: PerformanceMeasurement,
  options: PerformanceReportOptions
): Promise<void> {
  try {
    const { module = 'performance', context = {}, userId, tenantId = 'system' } = options;
    
    // Log to system events
    await logSystemEvent(
      module,
      'info',
      {
        description: `Performance: ${measurement.name} - ${measurement.duration?.toFixed(2)}ms`,
        event_type: 'performance_metric',
        metric_name: measurement.name,
        duration_ms: measurement.duration,
        ...measurement.metadata,
        ...context
      },
      tenantId
    );
  } catch (error) {
    console.error('Failed to report performance measurement:', error);
  }
}

/**
 * Measure the performance of an async function
 * 
 * @param name Measurement name
 * @param type Metric type
 * @param fn Function to measure
 * @param metadata Additional metadata
 * @param options Reporting options
 * @returns The function result
 */
export async function measureAsync<T>(
  name: string,
  type: PerformanceMetricName,
  fn: () => Promise<T>,
  metadata: Record<string, any> = {},
  options: PerformanceReportOptions = {}
): Promise<T> {
  const measureId = startMeasurement(type, name, metadata);
  
  try {
    const result = await fn();
    endMeasurement(measureId, { success: true }, options);
    return result;
  } catch (error) {
    endMeasurement(measureId, { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, options);
    throw error;
  }
}

/**
 * Performance monitoring hook for React components
 */
export function usePerformanceMonitoring() {
  return {
    startMeasurement,
    endMeasurement,
    measureAsync
  };
}

/**
 * Track vital user-centric performance metrics
 */
export function initializeVitalsTracking(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Report web vitals when available
  try {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportPerformanceMeasurement(
            {
              name: 'web-vitals:FCP',
              startTime: 0,
              endTime: entry.startTime,
              duration: entry.startTime,
              metadata: { rawEntry: entry.toJSON() }
            },
            { module: 'web-vitals' }
          );
        }
      }
    });
    
    observer.observe({ type: 'paint', buffered: true });
    
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      reportPerformanceMeasurement(
        {
          name: 'web-vitals:LCP',
          startTime: 0,
          endTime: lastEntry.startTime,
          duration: lastEntry.startTime,
          metadata: { rawEntry: lastEntry.toJSON() }
        },
        { module: 'web-vitals' }
      );
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        reportPerformanceMeasurement(
          {
            name: 'web-vitals:FID',
            startTime: entry.processingStart,
            endTime: entry.processingEnd,
            duration: entry.processingEnd - entry.processingStart,
            metadata: { 
              rawEntry: entry.toJSON(),
              inputDelay: entry.processingStart - entry.startTime
            }
          },
          { module: 'web-vitals' }
        );
      }
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (error) {
    console.error('Failed to initialize performance tracking:', error);
  }
}

// Auto-initialize performance tracking
if (typeof window !== 'undefined') {
  // Initialize after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      initializeVitalsTracking();
    }, 0);
  });
}
