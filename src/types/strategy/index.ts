
import { Notification } from '../notifications';

// Define the input interface for executing a strategy
export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

// Define the result interface for a strategy execution
export interface ExecuteStrategyResult {
  success: boolean;
  error?: string;
  execution_id?: string;
  execution_time?: number;
  outputs?: Record<string, any>;
  results?: Record<string, any>;
  logs?: Array<any>;
}

// Define a notification type for strategy status notifications
export interface StrategyStatusNotification extends Omit<Notification, 'id' | 'created_at'> {
  tenant_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  action_label?: string;
  is_read: boolean;
}

export * from './fixed';
