
/**
 * @file Auto Evolution System
 * Automated agent evolution and optimization system for Allora OS
 * 
 * This module manages the automatic evolution of agents based on performance data,
 * user feedback, and machine learning techniques to continuously improve agent capabilities.
 */

// Re-export all functionality from the evolution directory
// This maintains backward compatibility with code referencing this file
export * from './evolution';

/**
 * Agent Evolution System
 * 
 * The Agent Evolution System improves agent performance over time through:
 * 
 * 1. Performance Tracking - Monitoring success rates and execution metrics
 * 2. Feedback Collection - Gathering explicit user feedback via voting
 * 3. Automatic Analysis - Identifying patterns in successful vs. unsuccessful executions
 * 4. Prompt Optimization - Refining agent prompts based on collected data
 * 5. A/B Testing - Comparing new versions against baseline performance
 * 6. Version Management - Tracking agent versions and their relative performance
 * 
 * Evolution Process:
 * 
 * 1. The system periodically checks for agents eligible for evolution
 * 2. Performance metrics and user feedback are analyzed
 * 3. If improvement is needed, a new agent version is generated
 * 4. The new version is tested in parallel with the current version
 * 5. If the new version performs better, it becomes the active version
 * 
 * Metrics Tracked:
 * 
 * - Success rate: Percentage of successful executions
 * - Response quality: User votes and feedback
 * - Execution time: Performance efficiency
 * - Error rate: Frequency of errors and failures
 * - XP earned: Accumulated experience points
 * 
 * @see {@link checkEvolutionNeeded} to determine if an agent should evolve
 * @see {@link createEvolvedAgent} to generate a new agent version
 * @see {@link calculatePerformance} to analyze agent metrics
 */

/**
 * Sample usage:
 * 
 * ```typescript
 * import { autoEvolveAgents } from '@/lib/agents/autoEvolve';
 * 
 * // Trigger automatic evolution for all eligible agents
 * const result = await autoEvolveAgents();
 * 
 * console.log(`Evolved ${result.evolvedCount} agents`);
 * console.log(`Skipped ${result.skippedCount} agents (not eligible for evolution)`);
 * ```
 */
