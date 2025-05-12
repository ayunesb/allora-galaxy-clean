
/**
 * Strategy entity interface
 */
export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'in_progress' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  tenant_id: string;
  priority: 'high' | 'medium' | 'low' | null;
  tags: string[] | null;
  due_date: string | null;
  completion_percentage: number | null;
  metadata: Record<string, any> | null;
}

/**
 * Strategy creation input
 */
export interface CreateStrategyInput {
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  due_date?: string;
  tenant_id: string;
  metadata?: Record<string, any>;
}

/**
 * Strategy update input
 */
export interface UpdateStrategyInput {
  title?: string;
  description?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'in_progress' | 'completed';
  priority?: 'high' | 'medium' | 'low' | null;
  tags?: string[] | null;
  due_date?: string | null;
  completion_percentage?: number;
  metadata?: Record<string, any> | null;
}

/**
 * Strategy approval input
 */
export interface ApproveStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id: string;
  comments?: string;
}

/**
 * Strategy rejection input
 */
export interface RejectStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id: string;
  reason?: string;
}
