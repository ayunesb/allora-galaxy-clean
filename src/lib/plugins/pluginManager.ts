
/**
 * @file Plugin Manager
 * Core module for plugin management and execution in Allora OS
 * 
 * The Plugin Manager provides a unified interface for working with plugins,
 * including registration, discovery, execution and tracking.
 */

// Re-export all functionality from individual modules for backward compatibility
// This allows importing directly from pluginManager while maintaining a modular structure
export * from './index';

// Add comprehensive documentation comments
/**
 * Plugin Management System
 * 
 * The Plugin Management System in Allora OS consists of several key components:
 * 
 * 1. Plugin Registry - Maintains a catalog of available plugins
 * 2. Plugin Execution Engine - Handles running plugins with appropriate context
 * 3. Plugin Evolution System - Tracks and improves plugin performance over time
 * 4. Plugin Logging System - Records execution details for auditing and analysis
 * 
 * Architecture:
 * 
 * - Plugins are modular components that implement the Plugin interface
 * - Each plugin has metadata (name, version, description) and an execute function
 * - Plugins can be versioned, allowing for evolution over time
 * - Execution results are tracked for performance analysis
 * - Plugins can be composed into chains for complex operations
 * 
 * Best practices:
 * 
 * - Register plugins at startup
 * - Use plugin IDs consistently for tracking and reference
 * - Handle plugin failures gracefully
 * - Monitor plugin performance metrics
 * - Evolve plugins based on user feedback and performance data
 * 
 * @see {@link pluginTypes} for type definitions
 * @see {@link executePlugin} for plugin execution
 * @see {@link recordLogExecution} for logging
 */

/**
 * Sample usage:
 * 
 * ```typescript
 * import { executePlugin } from '@/lib/plugins/pluginManager';
 * 
 * // Execute a plugin with input parameters
 * const result = await executePlugin({
 *   pluginId: 'weather-plugin',
 *   tenantId: 'tenant-123',
 *   userId: 'user-456',
 *   input: { location: 'San Francisco' }
 * });
 * 
 * if (result.success) {
 *   console.log('Plugin execution succeeded:', result.output);
 * } else {
 *   console.error('Plugin execution failed:', result.error);
 * }
 * ```
 */
