
// Central type exports file
// This file re-exports all types from the type system for easier imports

// Re-export types from their respective domains
export type * from './navigation';
export type * from './user';
export type * from './tenant';
export type * from './strategy';
export type * from './plugin';
export type * from './voting';
export type * from './logs';
export type * from './kpi';
export type * from './trends';
export type * from './execution';
export type * from './evolution';

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

// DateRange type used for date filters
export interface DateRange {
  from: Date;
  to?: Date;
}
