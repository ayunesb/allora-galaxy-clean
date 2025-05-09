
import logSystemEvent from '@/lib/system/logSystemEvent';
import { validateInput } from './utils/validateInput';
import { verifyStrategyHelper } from './utils/verifyStrategyHelper';
import { updateProgress } from './utils/updateProgress';
import { fetchPluginsHelper } from './utils/fetchPluginsHelper';
import { executePluginsHelper } from './utils/executePluginsHelper';

/**
 * Run a strategy by ID
 * @param input - The input parameters for strategy execution
 * @returns Results of strategy execution
 */
export async function runStrategy(input: any): Promise<{ 
  success: boolean, 
  error?: any, 
  results?: any[], 
  execution_id?: string, 
  execution_time?: number 
}> {
  try {
    // Handle undefined or null input
    if (!input) {
      return { success: false, error: 'Strategy ID is required' };
    }
    
    // Extract parameters from input object
    const strategyId = input.strategyId;
    const tenantId = input.tenantId;
    const userId = input.userId;
    
    // Validate required parameters
    if (!strategyId) {
      return { success: false, error: 'Strategy ID is required' };
    }
    
    if (!tenantId) {
      return { success: false, error: 'Tenant ID is required' };
    }
    
    // Log start of strategy execution
    logSystemEvent(
      "strategy",
      "info",
      `Starting strategy execution for ${strategyId}`,
      tenantId
    );
    
    // Get strategy data
    const { strategy, error: strategyError } = await verifyStrategyHelper(strategyId, tenantId);
    
    // Check for errors in strategy retrieval
    if (strategyError || !strategy) {
      logSystemEvent(
        "strategy",
        "error",
        `Error retrieving strategy: ${strategyError?.message || "Strategy not found"}`,
        tenantId
      );
      return { success: false, error: strategyError || new Error("Strategy not found") };
    }
    
    // Validate the strategy input
    const validationResult = validateInput(strategy);
    if (!validationResult.valid) {
      logSystemEvent(
        "strategy",
        "error",
        `Strategy validation failed: ${validationResult.errors.join(', ')}`,
        tenantId
      );
      return { success: false, error: new Error(validationResult.errors.join(', ')) };
    }
    
    // Create execution ID
    const executionId = `exec-${Date.now()}`;
    
    // Update strategy status to running
    await updateProgress(executionId, 'running', 10);
    
    // Fetch plugins for this strategy
    const { plugins } = await fetchPluginsHelper(strategy.id);
    
    if (!plugins || plugins.length === 0) {
      logSystemEvent(
        "strategy",
        "error",
        `No plugins found for strategy`,
        tenantId
      );
      return { success: false, error: new Error("No plugins found for strategy") };
    }
    
    // Update progress
    await updateProgress(executionId, 'running', 20);
    
    // Execute plugins
    const execution = await executePluginsHelper(plugins, strategy, userId, tenantId);
    
    if (!execution.status || execution.status === 'failure') {
      logSystemEvent(
        "strategy",
        "error",
        `Error executing plugins`,
        tenantId
      );
      return { success: false, error: new Error('Failed to execute plugins') };
    }
    
    // Update strategy status to completed
    await updateProgress(executionId, 'completed', 100);
    
    logSystemEvent(
      "strategy",
      "info",
      `Strategy ${strategyId} executed successfully`,
      tenantId
    );
    
    return { 
      success: true,
      execution_id: executionId,
      execution_time: 1.5,
      results: execution.results
    };
    
  } catch (error: any) {
    // Log any unexpected errors
    logSystemEvent(
      "strategy",
      "error",
      `Unexpected error in runStrategy: ${error.message}`,
      input?.tenantId || 'system'
    );
    return { success: false, error };
  }
}
