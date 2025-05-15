
export interface Strategy {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress';
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  completion_percentage?: number;
  due_date?: string; // Add due_date field
}
