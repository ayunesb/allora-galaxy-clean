
// Core shared types used across the application

export type TrendDirection = 'up' | 'down' | 'neutral';

export type VoteType = 'up' | 'down';

export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

export type NotificationType = 'system' | 'strategy' | 'alert' | 'update' | 'info';

export interface FilterState {
  module?: string[];
  eventType?: string[];
  dateRange?: {
    from: Date | string | null;
    to: Date | string | null;
  };
  status?: string[];
  search?: string;
}

// Comment type used for agent voting
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

// Vote type for agent voting
export interface Vote {
  id: string;
  agent_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
}

// System log type
export interface SystemLog {
  id: string;
  tenant_id: string;
  module: string; 
  event: string;
  context: Record<string, any>;
  created_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
  status?: string;
}
