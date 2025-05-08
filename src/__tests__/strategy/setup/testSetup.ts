
import { vi, beforeEach, afterEach } from 'vitest';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined)
}));

// Setup and teardown functions
export const setupTests = () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
};
