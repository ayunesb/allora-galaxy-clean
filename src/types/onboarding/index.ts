
/**
 * @file Onboarding Types
 * Type definitions for the onboarding flow with namespace to avoid conflicts
 * 
 * This file re-exports types from the onboarding module while maintaining
 * a clean type structure and avoiding naming conflicts with other modules.
 */

// Re-export from onboarding with namespace to avoid conflicts
export * from './types';

// Export OnboardingStep from shared types for use in onboarding components
export { type OnboardingStep } from '../shared';

/**
 * Onboarding System
 * 
 * The Onboarding system guides new users through the setup process with:
 * 
 * 1. Multi-step wizard interface
 * 2. Data collection for tenant configuration
 * 3. Company profile setup
 * 4. Persona definition
 * 5. Initial strategy generation
 * 
 * Flow structure:
 * 
 * 1. Welcome/introduction screen
 * 2. Company information collection
 * 3. Persona/tone preference setting
 * 4. Initial strategy generation based on inputs
 * 5. Additional customization options
 * 6. Completion and dashboard introduction
 * 
 * Data collected during onboarding is used to:
 * - Create the tenant workspace
 * - Configure default settings
 * - Generate initial AI strategies
 * - Personalize the user experience
 * 
 * @see OnboardingStep for the step identifiers
 * @see OnboardingData for the full structure of collected data
 */
