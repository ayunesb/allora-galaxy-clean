
import { Json } from '../supabase';

export interface Strategy {
  id: string;
  title: string;
  description: string;
  tenant_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  status: string;
  created_by?: string | null;
  approved_by?: string | null;
  due_date?: string | null;
  priority?: string | null;
  tags?: string[] | null;
  completion_percentage?: number | null;
  metadata?: Json | null;
}

export interface StrategyFilter {
  status?: string[];
  priority?: string[];
  tags?: string[];
  search?: string;
  dueDate?: Date;
}

export interface StrategyExecution {
  id: string;
  strategy_id: string;
  status: string;
  created_at: string;
  execution_time?: number;
  plugins_executed?: number;
  error?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
