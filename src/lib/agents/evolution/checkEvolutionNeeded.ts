
import { calculatePerformance } from './calculatePerformance';

export interface EvolutionConfig {
  evolutionThreshold?: number;
  minimumExecutions?: number;
  failureRateThreshold?: number;
  staleDays?: number;
}

/**
 * Check if an agent needs evolution based on performance metrics
 * @param stats Usage statistics for the agent
 * @param config Configuration for evolution triggers
 * @returns Boolean indicating if evolution is needed and reason
 */
export function checkEvolutionNeeded(
  stats: any[], 
  createdAt: string, 
  config: EvolutionConfig = {}
): { needed: boolean; reason: string; performance: number } {
  // Default configuration
  const {
    evolutionThreshold = 0.7,
    minimumExecutions = 10,
    failureRateThreshold = 0.2,
    staleDays = 30
  } = config;

  // Check for minimum executions
  if (stats.length < minimumExecutions) {
    return { 
      needed: false, 
      reason: `Insufficient data: ${stats.length}/${minimumExecutions} executions`, 
      performance: 0 
    };
  }

  // Calculate performance score
  const performance = calculatePerformance(stats);
  
  // Check if performance is below threshold
  if (performance < evolutionThreshold) {
    return { 
      needed: true, 
      reason: `Performance below threshold: ${performance.toFixed(2)} < ${evolutionThreshold}`, 
      performance 
    };
  }

  // Check failure rate
  const failureCount = stats.filter(log => log.status !== 'success').length;
  const failureRate = stats.length > 0 ? failureCount / stats.length : 0;
  
  if (failureRate > failureRateThreshold) {
    return { 
      needed: true, 
      reason: `High failure rate: ${(failureRate * 100).toFixed(1)}% > ${(failureRateThreshold * 100).toFixed(1)}%`, 
      performance 
    };
  }

  // Check for staleness
  const now = new Date();
  const creationDate = new Date(createdAt);
  const daysSinceCreation = (now.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
  
  if (daysSinceCreation > staleDays) {
    return { 
      needed: true, 
      reason: `Agent is stale: ${Math.floor(daysSinceCreation)} days old`, 
      performance 
    };
  }

  // No evolution needed
  return { needed: false, reason: 'Agent is performing well', performance };
}
