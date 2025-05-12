// Central type exports file
// This file re-exports all types from the type system for easier imports

// Re-export types from their respective domains
export type * from './navigation';
export type * from './user';
export type * from './tenant';
export type * from './plugin';
export type * from './voting';
export type * from './logs';
export type * from './kpi';
export type * from './trends';
export type * from './execution';
export type * from './evolution';

// Handle strategy types separately to avoid ValidationResult naming conflicts
export type { 
  Strategy, 
  StrategyFilter, 
  StrategyExecution,
  // Rename ValidationResult from strategy to avoid conflict
  ValidationResult as StrategyValidationResult
} from './strategy';

// Explicitly handle ValidationResult conflict by not re-exporting it directly
export type { 
  OnboardingStep, 
  OnboardingFormData,
  OnboardingState,
  OnboardingStore,
  OnboardingStateActions,
  PersonaProfile,
  // Renamed to avoid ambiguity
  OnboardingValidationResult
} from './onboarding';

export type * from './notifications';
export type * from './galaxy';

// DateRange type used for date filters - now defined to match react-day-picker's DateRange
export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

export * from './shared';
