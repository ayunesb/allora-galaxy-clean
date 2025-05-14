
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
  workspace?: Workspace;
  workspaces: WorkspaceWithRole[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace?: (workspace: { name: string; slug?: string }) => Promise<Workspace>;
  navigation?: {
    items: {
      name: string;
      href: string;
      icon: React.ComponentType;
      current: boolean;
    }[];
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
}

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
