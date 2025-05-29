// Re-export all plugin functionality from the main index file
// to maintain backward compatibility

// Logging
export { recordLogExecution } from "./logging/recordLogExecution";

// Execution
export { recordExecution } from "./execution/recordExecution";
export { executePlugin } from "./execution/executePlugin";
export { executePluginChain } from "./execution/executePluginChain";

// Repository
export { getActivePlugins } from "./repository/getPlugins";

// Types
export type { PluginResult } from "@/types/plugin";
