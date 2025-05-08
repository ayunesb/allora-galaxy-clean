
import { describe, it, expect, vi } from 'vitest';
import { runStrategy } from '@/lib/strategy/runStrategy';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null })
    }
  }
}));

// Mock logging function
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(true)
}));

describe('Edge Functions Integration', () => {
  it('should call the executeStrategy edge function', async () => {
    const result = await runStrategy({
      strategyId: '123',
      tenantId: '456',
      userId: '789'
    });
    expect(result.success).toBe(true);
  });
});
