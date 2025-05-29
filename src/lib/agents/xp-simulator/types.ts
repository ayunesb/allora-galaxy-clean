import { v4 as uuidv4 } from "uuid";

export interface SimulateXpOptions {
  agent_version_id: string;
  tenant_id: string;
  xp_amount?: number;
  upvotes?: number;
  downvotes?: number;
  simulate_logs?: boolean;
  log_count?: number;
  extra?: Record<string, unknown>;
}

export interface SimulateVotesOptions {
  agent_version_id: string;
  tenant_id: string;
  upvotes?: number;
  downvotes?: number;
  extra?: Record<string, unknown>;
}

export interface XpAccumulationResult {
  votesResult?: unknown;
  logsResult?: unknown;
  xpUpdated?: {
    agent_version_id: string;
    previous: number;
    current: number;
    delta: {
      xp: number;
      upvotes: number;
      downvotes: number;
    };
  };
  promotionCheck?: unknown;
}

export interface LogSimulationResult {
  logId: string;
  success: boolean;
}

export interface VoteSimulationResult {
  voteId: string;
  result: 'success' | 'fail';
}

export function generateUuid(): string {
  return uuidv4();
}
