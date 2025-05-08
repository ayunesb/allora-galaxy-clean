
import { vi } from "vitest";

// Define mockData
const mockData = [
  { id: 'test-id', status: 'success', execution_time: 1.2 }
];

const mockClient = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          data: [...mockData],
          error: null,
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({ data: {}, error: null }),
  }),
};

vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: mockClient,
  };
});

export { mockClient as supabase };
