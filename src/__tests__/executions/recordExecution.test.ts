
import { describe, it, expect, vi } from 'vitest';
import { recordExecution } from '@/lib/executions/recordExecution';
import { LogStatus, ExecutionRecordInput } from '@/types/fixed';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
  },
}));

describe('recordExecution', () => {
  it('should record an execution', async () => {
    const input: ExecutionRecordInput = {
      tenantId: 'test-tenant',
      status: 'success' as LogStatus,
      type: 'test-type',
    };

    await recordExecution(input);
    
    // Assertions would normally go here to verify the function was called with correct arguments
  });
});
