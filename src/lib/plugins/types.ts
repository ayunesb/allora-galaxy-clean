// Re-export plugin types from the unified type system
export type {
  Plugin,
  PluginResult,
  RunPluginChainResult,
} from "@/types/plugin";

// Define missing types that were referenced but not exported in @/types
export interface PluginConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  parameters?: Record<string, any>;
}

export interface PluginExecutionOptions {
  timeout?: number;
  maxRetries?: number;
  logLevel?: "debug" | "info" | "warn" | "error";
}
