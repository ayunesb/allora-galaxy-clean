import { autoEvolveAgents } from '../agents/evolution/autoEvolveAgents';

/**
 * Run the agent evolution job to automatically evolve under-performing agents
 */
export async function runAgentEvolutionJob() {
  console.log('Running scheduled agent evolution job');
  
  try {
    const result = await autoEvolveAgents({
      minimumExecutions: 5,     // Require at least 5 executions
      failureRateThreshold: 0.2, // 20% failure rate threshold
      staleDays: 14,            // Consider agents stale after 14 days
      batchSize: 20             // Process up to 20 agents per run
    });
    
    console.log(`Agent evolution job completed: ${result.agentsEvolved} agents evolved`);
    
    if (result.errors.length > 0) {
      console.warn(`Agent evolution had ${result.errors.length} errors:`, result.errors[0]);
    }
    
    return result;
    
  } catch (error: any) {
    console.error('Error running agent evolution job:', error);
    throw error;
  }
}

/**
 * Run the log cleanup job to purge old logs
 */
export async function runLogCleanupJob() {
  console.log('Running scheduled log cleanup job');
  // Implementation for log cleanup
}
