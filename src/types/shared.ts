// Fix the SystemEventModule type to include all needed modules
export type SystemEventModule =
  | "auth"
  | "strategy"
  | "agent"
  | "plugin"
  | "system"
  | "billing"
  | "notification"
  | "user"
  | "tenant"
  | "workspace"
  | "admin"
  | "api"
  | "onboarding"
  | "database"; // Added database module to fix test errors

// Additional shared types to fix type errors
export interface PaginationOptions {
  page: number;
  perPage: number;
}

export interface SortOptions {
  column: string;
  direction: "asc" | "desc";
}

export interface TimeRange {
  value: string;
  label: string;
}

// Export VoteType to fix test errors
export type VoteType = "upvote" | "downvote";

// Add TrendDirection to fix KPICard build error
export type TrendDirection = "up" | "down" | "neutral";

// Update LogFilters interface to reference logs.ts implementation
export {
  type LogFilters,
  type LogLevel,
  type LogSeverity,
  type SystemLog,
  type DateRange,
} from "./logs";

// Export UserRole type to fix permission-related errors
export type UserRole = 'admin' | 'owner' | 'agent';
