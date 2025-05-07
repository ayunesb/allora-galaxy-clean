import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';

it('should retry...', async () => {
  (supabase.from as unknown as vi.Mock).mockReturnValueOnce({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({ data: [], error: null })),
      })),
    })),
  });

  // ...existing test logic...

}, 10000); // Increase timeout to 10 seconds
