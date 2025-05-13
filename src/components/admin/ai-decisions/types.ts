
import { SystemLog } from '@/types/logs';

export interface AiDecision extends SystemLog {
  decision_type: string;
  confidence?: number;
  reviewed?: boolean;
  review_outcome?: 'approved' | 'rejected' | 'modified';
  input?: Record<string, any>;
  output?: Record<string, any>;
  reviewer_id?: string;
  review_date?: string;
}

export interface AiDecisionFilterState {
  type: string;
  status: string;
  fromDate: Date | null;
  toDate: Date | null;
  searchTerm: string;
}
