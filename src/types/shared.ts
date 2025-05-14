
// Add these type definitions to the shared types file

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface WorkspaceWithRole {
  workspace: Workspace;
  role: string;
}

export interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: WorkspaceWithRole[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  refreshWorkspaces: () => Promise<void>;
  tenant: Workspace | null; // Alias for backward compatibility
  navigation?: {
    items: NavigationItem[];
  };
}

// Graph Types
export interface GraphNode {
  id: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  group?: number;
  metadata?: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Shared component types
export interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export interface StatsTableProps {
  stats: CronJobStats; 
  isLoading: boolean;
  rawStats?: CronJobStat[];
}

// CronJob Types
export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "inactive" | "error" | "running" | "pending";
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CronJobStat {
  id: string;
  job_id: string;
  execution_count: number;
  success_count: number;
  error_count: number;
  average_duration: number;
  last_execution_time?: string;
  status: "success" | "error" | "running" | "pending";
  period: "day" | "week" | "month" | "all";
}

export interface CronJobStats {
  day: CronJobStat[];
  week: CronJobStat[];
  month: CronJobStat[];
  all: CronJobStat[];
  total?: number;
  active?: number;
  pending?: number;
  failed?: number;
  completed?: number;
}

// Core shared types used across the application
export type TrendDirection = 'up' | 'down' | 'neutral';

export type VoteType = 'up' | 'down' | 'neutral';

export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export interface FilterState {
  module?: string[];
  eventType?: string[];
  dateRange?: {
    from: Date | string | null;
    to: Date | string | null;
  };
  status?: string[];
  search?: string;
}

// Export UserRole type
export type UserRole = 'admin' | 'owner' | 'member' | 'guest';

// System Log Types
export type SystemEventModule = 
  | "auth" 
  | "strategy" 
  | "plugin" 
  | "agent" 
  | "execution" 
  | "tenant" 
  | "admin" 
  | "system"
  | "webhook"
  | "workspace"
  | "user";

export type SystemLogLevel = 
  | "info" 
  | "warning" 
  | "error" 
  | "critical" 
  | "debug";

export interface SystemLog {
  id: string;
  module: SystemEventModule;
  level: SystemLogLevel;
  event: string;
  description: string;
  context: Record<string, any>;
  tenant_id: string;
  created_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

// Navigation item type
export interface NavigationItem {
  id?: string;
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  adminOnly?: boolean;
  badge?: string | number;
  isNew?: boolean;
  isExternal?: boolean;
}

// Shared types for notifications
export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  id?: string;
  onDismiss?: () => void;
  action?: React.ReactNode;
}
