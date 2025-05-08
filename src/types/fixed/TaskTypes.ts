
export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  due_date?: string;
  assigned_to?: string;
  created_by: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}
