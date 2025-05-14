
import { ReactNode } from 'react';

// Navigation
export interface NavigationItem {
  id: string;
  title: string;
  icon?: React.ComponentType;
  href?: string;
  items?: NavigationItem[];
  permission?: string;
  badge?: number;
}

// Common Data Types
export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

// Filter Types
export interface FilterState {
  search?: string;
  status?: string;
  dateRange?: DateRange;
  category?: string;
  type?: string;
  [key: string]: any;
}

export interface FilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

// User Types
export type UserRole = 'admin' | 'owner' | 'user' | 'guest';

// Trend Visualization
export type TrendDirection = 'up' | 'down' | 'flat';

// System Events
export type SystemEventModule = 'auth' | 'system' | 'strategy' | 'plugin' | 'agent' | 'tenant';
export type SystemEventType = 'info' | 'warning' | 'error' | 'success';

// Onboarding
export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'complete';

// Base Entity
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// KPI Trends
export interface KPITrend {
  name: string;
  value: number;
  previousValue?: number;
  trend: TrendDirection;
  percentageChange?: number;
}

// Execution
export type ExecutionType = 'strategy' | 'plugin' | 'agent';

export interface ExecutionParams {
  tenantId: string;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  input?: Record<string, any>;
}

// Tenant Features
export type TenantFeature = 'ai_generation' | 'automations' | 'advanced_analytics' | 'integrations';

// Voting
export type VoteType = 'up' | 'down';
