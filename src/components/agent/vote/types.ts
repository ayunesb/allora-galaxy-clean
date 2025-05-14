
// Re-export types with proper TypeScript module isolation
import type { VoteType } from '@/types/shared';

export type { VoteType };

export interface Vote {
  id: string;
  user_id: string;
  agent_version_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  agent_version_id: string;
  content: string;
  created_at: string;
}
