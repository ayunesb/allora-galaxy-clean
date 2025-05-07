
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { ExecuteStrategyInput } from '@/lib/strategy/types';

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
    const mockInput: ExecuteStrategyInput = {
      strategy_id: 'mock-strategy',
      tenant_id: 'mock-tenant',
      user_id: 'mock-user'
    };
    
    const result = await runStrategy(mockInput);
    expect(result.success).toBe(true);
  });
});
