
/**
 * This file provides mock implementations for modules used in tests
 * to help resolve TypeScript "Cannot find module" errors.
 */

// Mock implementation for any missing modules
export const mockModule = {
  default: {},
  // Add any specific exports that might be needed by tests
  createClient: jest.fn(),
  logSystemEvent: jest.fn(),
  voteOnAgentVersion: jest.fn(),
  runStrategy: jest.fn(),
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({})
      }),
      insert: jest.fn().mockReturnValue({}),
      update: jest.fn().mockReturnValue({})
    })
  }
};

// Auto-mock setup for Jest
jest.mock('@/lib/agents/vote', () => mockModule);
jest.mock('@/integrations/supabase/client', () => mockModule);
jest.mock('@/lib/system/logSystemEvent', () => mockModule);
jest.mock('@/lib/agents/autoEvolve', () => mockModule);
jest.mock('@/lib/executions/recordExecution', () => mockModule);
jest.mock('@/types/fixed', () => mockModule);
jest.mock('@/edge/executeStrategy', () => mockModule);
jest.mock('@/lib/strategy/runStrategy', () => mockModule);

// Add more mocks as needed for other modules
