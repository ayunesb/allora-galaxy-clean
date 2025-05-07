
// Re-export types from the unified type system
export type { Plugin, PluginConfig, PluginExecutionOptions } from '@/types/plugin';
import { PluginResult, RunPluginChainResult } from "@/types/fixed";

// Re-export the types for backward compatibility
export type { PluginResult, RunPluginChainResult };
