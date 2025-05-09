
import { vi, beforeEach, expect } from 'vitest';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Set up mocks for strategy tests
 */
export function setupTests() {
  // Mock logSystemEvent
  vi.mock('@/lib/system/logSystemEvent', () => ({
    logSystemEvent: vi.fn().mockResolvedValue({ success: true })
  }));

  // Mock Supabase client
  vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
      functions: {
        invoke: vi.fn()
      }
    }
  }));

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(logSystemEvent).mockResolvedValue({ success: true });
  });
}

// Helper for asserting calls to logSystemEvent
export function assertLogEventCalled(module: string, event: string, matchData?: any) {
  expect(logSystemEvent).toHaveBeenCalledWith(
    expect.any(String),
    module,
    expect.objectContaining(matchData || {}),
    expect.any(String)
  );
}
