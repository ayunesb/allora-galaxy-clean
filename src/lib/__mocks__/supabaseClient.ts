
// Create a mock implementation of Supabase client for testing
import { vi } from 'vitest';

// Export the centralized mock implementation
export const supabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(callback => callback({ data: [], error: null }))
  }),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null })
  },
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.png' } })
    })
  },
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: {}, error: null })
  }
};
