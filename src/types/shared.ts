
import { ReactNode } from 'react';

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface MenuItem {
  title: string;
  href: string;
  icon?: ReactNode;
  disabled?: boolean;
  external?: boolean;
}

export type SystemEventModule = 
  | 'auth' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'webhook' 
  | 'notification' 
  | 'system'
  | 'billing'
  | 'execution'
  | 'email'
  | 'onboarding';

export type SystemEventType = string;

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}
