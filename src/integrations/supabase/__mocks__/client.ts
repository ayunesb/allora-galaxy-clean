vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: [...mockData],
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({ data: {}, error: null }),
      }),
    },
  };
});
