
import { SystemLog } from '@/types/logs';

/**
 * Interface representing an AI decision record
 */
export interface AiDecision extends SystemLog {
  // Decision metadata
  decision_type?: string;
  confidence?: number;
  confidence_score?: number;
  
  // Review information
  reviewed?: boolean;
  review_outcome?: 'approved' | 'rejected' | 'modified';
  reviewer_id?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_date?: string;
  
  // Input and output
  input?: Record<string, any>;
  output?: Record<string, any>;
  
  // AI model information
  model?: string;
  prompt?: string;
  completion?: string;
  tokens_used?: number;
  
  // Related resources
  strategy_id?: string;
  plugin_id?: string;
  
  // Additional data
  alternatives?: string[];
  metadata?: Record<string, any>;
}

/**
 * Filter state for AI decisions
 */
export interface AiDecisionFilterState {
  type: string;
  status: string;
  fromDate: Date | null;
  toDate: Date | null;
  searchTerm: string;
}
