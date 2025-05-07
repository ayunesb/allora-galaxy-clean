
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runStrategy } from '@/lib/strategy/runStrategy';

// Mock the supabase import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'strategy1' }, error: null }),
      insert: vi.fn().mockResolvedValue({ data: { id: 'execution1' }, error: null }),
    })),
  },
}));

describe('Execute Strategy', () => {
  it('should execute a strategy', async () => {
    const result = await runStrategy('mock-strategy');
    expect(result.success).toBe(true);
  });
});
