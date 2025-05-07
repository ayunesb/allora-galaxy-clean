import { vi } from 'vitest';

export const supabaseMock = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [{ id: 'test-id', status: 'success', execution_time: 1.2 }],
          error: null,
        })),
      })),
    })),
    insert: vi.fn(() => ({ data: {}, error: null })),
    update: vi.fn(() => ({ data: {}, error: null })),
  })),
};

vi.mock('@/integrations/supabase/client', () => {
  return { supabase: supabaseMock };
});
