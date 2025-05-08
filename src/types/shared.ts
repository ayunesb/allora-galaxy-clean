
// Define common system event modules and types if they don't exist
export type SystemEventModule = 'security' | 'strategy' | 'plugin' | 'system' | 'tenant' | 'user' | 'agent' | 'execution' | 'onboarding' | 'admin';
export type SystemEventType = 'error' | 'warning' | 'info' | 'success' | 'audit' | 'create' | 'update' | 'delete' | 
  'execute_strategy_started' | 'execute_strategy_error' | 'execute_strategy_completed' | 'step_completed' | 'onboarding_step_change' | 
  'onboarding_step_view' | 'onboarding_step_completed' | 'onboarding_completed' | 'onboarding_error' | 
  'user_invited' | 'plugin_executed' | 'plugin_execution_failed' | 'react_error_boundary';

// KPI and trend types
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  previousValue?: number;
  isPositive: boolean;
}

// Vote type for agent voting
export type VoteType = 'up' | 'down' | 'neutral';

// User and authentication types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

// Tenant and workspace types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  settings?: Record<string, any>;
}

export interface WorkspaceState {
  tenant: Tenant | null;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Common UI types
export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

// Navigation types
export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  external?: boolean;
  adminOnly?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

// Plugin and strategy types
export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  active: boolean;
  plugins: string[];
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// System log types
export interface SystemLog {
  id: string;
  module: SystemEventModule;
  event: SystemEventType;
  context?: Record<string, any>;
  tenant_id: string;
  created_at: string;
}

// Form field types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  validation?: {
    required?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: {
      value: RegExp;
      message: string;
    };
  };
}
