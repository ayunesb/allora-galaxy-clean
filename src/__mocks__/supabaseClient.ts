
import { vi } from 'vitest';

export const supabase = {
  rpc: vi.fn(() => Promise.resolve({ data: {}, error: null })),
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
  })),
};
