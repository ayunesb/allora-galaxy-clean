
import { v4 as uuidv4 } from 'uuid';

export interface SimulateXpOptions {
  agent_version_id: string;
  tenant_id: string;
  xp_amount?: number;
  upvotes?: number;
  downvotes?: number;
  simulate_logs?: boolean;
  log_count?: number;
}

export interface VoteSimulationResult {
  agent_version_id: string;
  votes: any[];
}

export interface LogSimulationResult {
  agent_version_id: string;
  logs: any[];
  xp_earned: number;
}

export interface XpAccumulationResult {
  votesResult: VoteSimulationResult | null;
  logsResult: LogSimulationResult | null;
  xpUpdated: {
    agent_version_id: string;
    previous: { xp: number; upvotes: number; downvotes: number };
    current: { xp: number; upvotes: number; downvotes: number };
    delta: { xp: number; upvotes: number; downvotes: number };
  };
  promotionCheck: any;
}

export function generateUuid(): string {
  return uuidv4();
}
