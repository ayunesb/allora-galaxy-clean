
import { SystemLog } from '@/types/logs';

// AiDecision extends SystemLog with additional AI-specific properties
export interface AiDecision extends SystemLog {
  model?: string;
  prompt?: string;
  completion?: string;
  tokens_used?: number;
  decision_type?: string;
  confidence_score?: number;
  alternatives?: string[];
  metadata?: Record<string, any>;
}
