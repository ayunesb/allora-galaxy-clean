// System event modules
export const SYSTEM_EVENT_MODULES = [
  "auth",
  "strategy",
  "plugin",
  "system",
  "tenant",
  "execution",
  "agent",
  "kpi",
];

// System event types
export const SYSTEM_EVENT_TYPES = [
  "create",
  "update",
  "delete",
  "error",
  "login",
  "logout",
  "execute",
  "approve",
  "reject",
  "complete",
];

// Log levels
export const LOG_LEVELS = ["error", "warn", "info", "debug"];

// Status codes for different entities
export const STATUS_CODES = {
  STRATEGY: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    DRAFT: "draft",
  },
  EXECUTION: {
    SUCCESS: "success",
    FAILURE: "failure",
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
  },
};
