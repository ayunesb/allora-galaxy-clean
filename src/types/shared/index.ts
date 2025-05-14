
// Re-export all shared types and interfaces
export * from './types';

// Common enums
export enum VoteType {
  Up = 'up',
  Down = 'down',
  Neutral = 'neutral'
}

export enum TrendDirection {
  Up = 'up',
  Down = 'down',
  Neutral = 'neutral'
}

export enum FilterState {
  All = 'all',
  Active = 'active',
  Complete = 'complete',
  Pending = 'pending'
}

export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  System = 'system'
}

export type DateRange = {
  from: Date;
  to?: Date;
};

export type OnboardingStep = 
  | 'welcome'
  | 'company'
  | 'persona'
  | 'team'
  | 'goals'
  | 'complete';
