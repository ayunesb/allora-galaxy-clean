
import { vi } from 'vitest';

/**
 * This file provides mock implementations for modules used in tests
 * to help resolve TypeScript "Cannot find module" errors.
 */

// Mock implementation for any missing modules
export const mockModule = {
  default: {},
  // Add any specific exports that might be needed by tests
  createClient: vi.fn(),
  logSystemEvent: vi.fn(),
  voteOnAgentVersion: vi.fn(),
  runStrategy: vi.fn(),
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({})
      }),
      insert: vi.fn().mockReturnValue({}),
      update: vi.fn().mockReturnValue({})
    })
  }
};

// Define mockData array globally
export const mockData = [
  { id: 'test-id-1', name: 'Test Item 1' },
  { id: 'test-id-2', name: 'Test Item 2' }
];

// Auto-mock setup for Jest/Vitest
vi.mock('@/lib/agents/vote', () => mockModule);
vi.mock('@/integrations/supabase/client', () => mockModule);
vi.mock('@/lib/system/logSystemEvent', () => mockModule);
vi.mock('@/lib/agents/autoEvolve', () => mockModule);
vi.mock('@/lib/executions/recordExecution', () => mockModule);
vi.mock('@/types/fixed', () => mockModule);
vi.mock('@/edge/executeStrategy', () => mockModule);
vi.mock('@/lib/strategy/runStrategy', () => mockModule);
vi.mock('@/context/AuthContext', () => mockModule);
vi.mock('@/context/WorkspaceContext', () => mockModule);
vi.mock('@/services/notificationService', () => mockModule);
vi.mock('@/types/onboarding', () => mockModule);
vi.mock('@/services/onboardingService', () => mockModule);
vi.mock('@/hooks/useOnboardingSteps', () => mockModule);
vi.mock('@/hooks/useOnboardingForm', () => mockModule);
vi.mock('@/hooks/useOnboardingSubmission', () => mockModule);
vi.mock('@/hooks/useOnboardingRedirect', () => mockModule);
vi.mock('@/hooks/useStrategyGeneration', () => mockModule);
vi.mock('@/lib/supabase', () => mockModule);
vi.mock('@/types/galaxy', () => mockModule);

// Add more mocks as needed for other modules
