
import { ReactNode } from "react";
import { DateRange as ReactDayPickerDateRange } from 'react-day-picker';

// Navigation-related types
export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: NavigationItem[];
}

// User and role types
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
  USER = 'user'
}

// System logs and events
export type SystemEventModule = 
  | 'auth'
  | 'system'
  | 'api'
  | 'tenant'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'user';

export type LogSeverity = 
  | 'info'
  | 'warning'
  | 'error'
  | 'debug';

// Common enums
export enum VoteType {
  UP = 'up',
  DOWN = 'down'
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// Re-export DateRange from react-day-picker to ensure consistency
export type DateRange = ReactDayPickerDateRange;
