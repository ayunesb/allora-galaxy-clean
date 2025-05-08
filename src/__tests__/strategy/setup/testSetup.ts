
import { beforeEach, afterEach, vi } from 'vitest';

export function setupTests() {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
}

export function setupMockedSupabase() {
  vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
      functions: {
        invoke: vi.fn()
      }
    }
  }));
}

export function setupMockedLogSystem() {
  vi.mock('@/lib/system/logSystemEvent', () => ({
    logSystemEvent: vi.fn().mockResolvedValue(undefined)
  }));
}
