
import { ENV } from '../env/envUtils';
import { supabase } from '../supabase';

/**
 * Health status types
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  services: {
    database?: {
      status: HealthStatus;
      responseTime?: number;
      message?: string;
    };
    edgeFunctions?: {
      status: HealthStatus;
      responseTime?: number;
      message?: string;
    };
    api?: {
      status: HealthStatus;
      responseTime?: number;
      message?: string;
    };
  };
  environment: string;
  version: string;
}

/**
 * Check the health of various system components
 */
export async function checkSystemHealth(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  const environment = ENV('NODE_ENV', 'development');
  const version = ENV('VITE_APP_VERSION', '1.0.0');
  
  // Initialize result
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
    environment,
    version
  };
  
  try {
    // Check database connectivity
    const dbStartTime = performance.now();
    const { error: dbError } = await supabase.from('system_status').select('count').single();
    const dbResponseTime = performance.now() - dbStartTime;
    
    result.services.database = {
      status: dbError ? 'unhealthy' : 'healthy',
      responseTime: Math.round(dbResponseTime),
      message: dbError ? dbError.message : 'Connected successfully',
    };
    
    // Check edge function
    const edgeStartTime = performance.now();
    const { error: edgeError } = await supabase.functions.invoke('health-check', {
      body: { timestamp: Date.now() },
    });
    const edgeResponseTime = performance.now() - edgeStartTime;
    
    result.services.edgeFunctions = {
      status: edgeError ? 'unhealthy' : 'healthy',
      responseTime: Math.round(edgeResponseTime),
      message: edgeError ? edgeError.message : 'Functions responding',
    };
    
    // Determine overall status
    if (result.services.database?.status === 'unhealthy' || 
        result.services.edgeFunctions?.status === 'unhealthy') {
      result.status = 'unhealthy';
    } else if (
      result.services.database?.status === 'degraded' || 
      result.services.edgeFunctions?.status === 'degraded'
    ) {
      result.status = 'degraded';
    }
    
  } catch (error) {
    console.error('Health check failed:', error);
    result.status = 'unhealthy';
  }
  
  // Add total response time
  const totalTime = performance.now() - startTime;
  result.services.api = {
    status: result.status,
    responseTime: Math.round(totalTime),
    message: `Health check completed in ${Math.round(totalTime)}ms`
  };
  
  return result;
}

/**
 * Generate a detailed health report suitable for admin dashboards
 */
export async function generateHealthReport(): Promise<HealthCheckResult & { details: Record<string, any> }> {
  const basicHealth = await checkSystemHealth();
  
  // Get additional system details
  const details: Record<string, any> = {
    cacheStatus: 'operational',
    quotaUsage: {},
    jobQueueStatus: 'operational',
    resourceUtilization: {},
  };
  
  try {
    // Check system metrics
    const { data: metricsData } = await supabase
      .from('system_metrics')
      .select('cpu_usage, memory_usage, storage_usage, api_quota_used, api_quota_limit')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (metricsData) {
      details.resourceUtilization = {
        cpu: metricsData.cpu_usage,
        memory: metricsData.memory_usage,
        storage: metricsData.storage_usage,
      };
      
      details.quotaUsage = {
        api: {
          used: metricsData.api_quota_used,
          total: metricsData.api_quota_limit,
          percentage: Math.round((metricsData.api_quota_used / metricsData.api_quota_limit) * 100),
        }
      };
    }
    
    // Check job queue status
    const { data: jobsData } = await supabase
      .from('cron_jobs')
      .select('status')
      .in('status', ['failed', 'stuck'])
      .limit(5);
    
    details.jobQueueStatus = jobsData && jobsData.length > 0 ? 'degraded' : 'operational';
    
  } catch (error) {
    console.error('Error generating detailed health report:', error);
    details.errorGeneratingReport = true;
  }
  
  return {
    ...basicHealth,
    details
  };
}
