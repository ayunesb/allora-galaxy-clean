
import { VoteType } from './voting';
import { TrendDirection } from './kpi';

// Re-export types from other files to shared for easier imports
export { VoteType, TrendDirection };

// Add other shared types here
export type DateRange = {
  from?: Date;
  to?: Date;
};
