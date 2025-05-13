
import { SystemLog } from '@/types/logs';

// AiDecision extends SystemLog with additional AI-specific properties
export interface AiDecision extends SystemLog {
  model?: string;
  prompt?: string;
  completion?: string;
  tokens_used?: number;
  decision_type?: string;
  confidence?: number;
  confidence_score?: number;
  alternatives?: string[];
  metadata?: Record<string, any>;
  reviewed?: boolean;
  review_outcome?: 'approved' | 'rejected' | 'modified';
  input?: Record<string, any>;
  output?: Record<string, any>;
  reviewer_id?: string;
  review_date?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  strategy_id?: string;
  plugin_id?: string;
}

export interface AiDecisionFilterState {
  type: string;
  status: string;
  fromDate: Date | null;
  toDate: Date | null;
  searchTerm: string;
}
