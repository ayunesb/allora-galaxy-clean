
// Mock implementation of Supabase client for testing
import { vi } from 'vitest';

// Create a comprehensive mock of the Supabase client
export const supabase = {
  auth: {
    onAuthStateChange: vi.fn(),
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'mock-user-id',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    }),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
  from: vi.fn().mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    csv: vi.fn().mockReturnThis(),
    throwOnError: vi.fn().mockReturnThis(),
  })),
  rpc: vi.fn().mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    throwOnError: vi.fn().mockReturnThis(),
  })),
  storage: {
    from: vi.fn().mockImplementation(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      getPublicUrl: vi.fn().mockImplementation(() => ({ data: { publicUrl: 'https://mock-url.com/image.png' } })),
    })),
  },
  channel: vi.fn().mockImplementation(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue({}),
  })),
  removeChannel: vi.fn(),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
};
