
import { vi, beforeEach } from 'vitest';

// Mock the logSystemEvent function
export const setupTests = () => {
  beforeEach(() => {
    // Mock supabase client
    vi.mock('@/integrations/supabase/client', () => ({
      supabase: {
        functions: {
          invoke: vi.fn().mockImplementation(() => Promise.resolve({
            data: { success: true, execution_id: 'test-id' },
            error: null
          }))
        }
      }
    }));
    
    // Mock system logging
    vi.mock('@/lib/system/logSystemEvent', () => ({
      logSystemEvent: vi.fn().mockImplementation(() => Promise.resolve())
    }));
  });
};
