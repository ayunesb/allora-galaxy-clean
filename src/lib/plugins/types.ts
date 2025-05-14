
/**
 * @file Plugin System Types
 * Type definitions for the plugin system in Allora OS
 * 
 * This file provides type definitions for the plugin system, including
 * plugin configuration, execution options, and result formats.
 */

// Re-export plugin types from the unified type system
export type { 
  /** Core plugin interface definition */
  Plugin, 
  /** Result of plugin execution */
  PluginResult, 
  /** Result of running a chain of plugins */
  RunPluginChainResult 
} from '@/types/plugin';

/**
 * Plugin Configuration
 * 
 * Defines plugin metadata and configuration settings
 * 
 * @property {string} id - Unique identifier for the plugin
 * @property {string} name - Display name for the plugin
 * @property {string} description - Description of plugin functionality
 * @property {string} version - Semantic versioning string (e.g., '1.2.3')
 * @property {Record<string, any>} [parameters] - Optional configuration parameters
 */
export interface PluginConfig {
  /** Unique identifier for the plugin */
  id: string;
  /** Display name for the plugin */
  name: string;
  /** Description of plugin functionality */
  description: string;
  /** Semantic versioning string (e.g., '1.2.3') */
  version: string;
  /** Optional configuration parameters */
  parameters?: Record<string, any>;
}

/**
 * Plugin Execution Options
 * 
 * Configuration options for plugin execution
 * 
 * @property {number} [timeout] - Maximum execution time in milliseconds
 * @property {number} [maxRetries] - Maximum number of retry attempts on failure
 * @property {string} [logLevel] - Log level for execution details
 */
export interface PluginExecutionOptions {
  /** Maximum execution time in milliseconds */
  timeout?: number;
  /** Maximum number of retry attempts on failure */
  maxRetries?: number;
  /** Log level for execution details */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Plugin System Architecture
 * 
 * The plugin system uses TypeScript interfaces to ensure type safety across:
 * 
 * 1. Plugin Definition - Structure and capabilities of plugins
 * 2. Execution Context - Environment and parameters for execution
 * 3. Result Format - Standardized output structure
 * 
 * This enables:
 * - Consistent plugin behavior
 * - Clear error handling
 * - Chainable plugin execution
 * - Performance monitoring
 * 
 * @example
 * ```typescript
 * const myPlugin: Plugin = {
 *   id: 'data-processor',
 *   name: 'Data Processor',
 *   version: '1.0.0',
 *   description: 'Processes input data into standardized format',
 *   execute: async (input, context) => {
 *     try {
 *       const result = processData(input);
 *       return { success: true, data: result };
 *     } catch (error) {
 *       return { 
 *         success: false, 
 *         error: error instanceof Error ? error.message : 'Unknown error'
 *       };
 *     }
 *   }
 * };
 * ```
 */
