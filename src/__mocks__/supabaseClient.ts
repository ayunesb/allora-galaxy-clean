export const supabase = {
  rpc: vi.fn(() => Promise.resolve({ data: {}, error: null })),
};