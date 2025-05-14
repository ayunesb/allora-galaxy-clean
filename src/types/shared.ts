export interface SystemLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  metadata: any;
}

export interface PluginLog {
  id: string;
  plugin_id: string;
  timestamp: string;
  level: string;
  message: string;
  input: any;
  output: any;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'owner';

export interface SystemLogFilter {
  module?: string;
  event?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  searchTerm?: string;
  level?: string;
  limit?: number;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface FilterState {
  searchTerm?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  type?: string;
  status?: string;
  [key: string]: any;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  disabled?: boolean;
  label?: string;
}

export type OnboardingStep = 'company-info' | 'additional-info' | 'persona' | 'strategy-generation' | 'completed';
