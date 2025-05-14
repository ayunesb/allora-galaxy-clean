
import { vi } from 'vitest';

// Create a comprehensive mock of the Supabase client for testing
export const createMockSupabaseClient = () => ({
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
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'mock-user-id', email: 'test@example.com' } }, 
      error: null 
    }),
  },
  from: vi.fn().mockImplementation((table) => ({
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
    single: vi.fn().mockImplementation(() => {
      // Default mock implementation for single()
      return Promise.resolve({ data: { id: `mock-${table}-id` }, error: null });
    }),
    maybeSingle: vi.fn().mockImplementation(() => {
      // Default mock implementation for maybeSingle()
      return Promise.resolve({ data: { id: `mock-${table}-id` }, error: null });
    }),
    csv: vi.fn().mockReturnThis(),
    throwOnError: vi.fn().mockReturnThis(),
  })),
  rpc: vi.fn().mockImplementation((procedure) => {
    // Default mock implementation for RPC calls
    return Promise.resolve({ data: { success: true }, error: null });
  }),
  storage: {
    from: vi.fn().mockImplementation((bucket) => ({
      upload: vi.fn().mockResolvedValue({ data: { path: `${bucket}/test.png` }, error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: { path: `${bucket}/test.png` }, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: vi.fn().mockImplementation((path) => ({ 
        data: { publicUrl: `https://mock-supabase.com/storage/v1/object/public/${bucket}/${path}` }
      })),
    })),
  },
  channel: vi.fn().mockImplementation((channelName) => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue({}),
  })),
  removeChannel: vi.fn(),
  functions: {
    invoke: vi.fn().mockImplementation((functionName, options) => {
      // Different responses based on function name
      if (functionName === 'executeStrategy') {
        return Promise.resolve({
          data: { 
            success: true,
            execution_id: 'mock-execution-id',
            execution_time: 1.5
          },
          error: null
        });
      }
      // Default response for other functions
      return Promise.resolve({ data: {}, error: null });
    }),
  },
});

// Export a pre-configured instance for easy import in tests
export const mockSupabaseClient = createMockSupabaseClient();

// Create a mock for the supabase module
export const mockSupabaseModule = {
  supabase: mockSupabaseClient,
  supabaseWithErrorHandler: {
    ...mockSupabaseClient,
    // Add any error handler specific mocks here
  },
  isAuthenticated: vi.fn().mockResolvedValue(true),
  getCurrentUserId: vi.fn().mockResolvedValue('mock-user-id'),
};
