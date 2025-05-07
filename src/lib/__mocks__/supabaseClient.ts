
import { vi } from 'vitest';

// Create mock data for common responses
const mockUsers = [
  { id: '123', email: 'user1@example.com', created_at: '2023-01-01T00:00:00Z' },
  { id: '456', email: 'user2@example.com', created_at: '2023-01-02T00:00:00Z' },
];

const mockTenants = [
  { id: 't1', name: 'Tenant 1', slug: 'tenant-1', owner_id: '123' },
  { id: 't2', name: 'Tenant 2', slug: 'tenant-2', owner_id: '456' },
];

// Create a mock data store to hold inserted data during tests
const dataStore: Record<string, any[]> = {
  'tenant_user_roles': [],
  'agent_votes': [],
  'plugin_logs': [],
  'executions': [],
  'strategies': [],
};

// Create a mock function for Supabase client
export const createMockSupabaseClient = () => {
  // Mock function to simulate responses for .from().select()
  const mockSelect = vi.fn().mockImplementation((table: string, columns: string) => {
    if (table === 'users') {
      return {
        data: mockUsers,
        error: null,
      };
    }
    if (table === 'tenants') {
      return {
        data: mockTenants,
        error: null,
      };
    }
    return {
      data: dataStore[table] || [],
      error: null,
    };
  });

  // Mock function to simulate responses for .from().insert()
  const mockInsert = vi.fn().mockImplementation((table: string, data: any) => {
    if (!dataStore[table]) {
      dataStore[table] = [];
    }
    
    // Add id if not present
    const insertedData = Array.isArray(data) 
      ? data.map(item => ({ id: `mock-${Math.random().toString(36)}`, ...item }))
      : { id: `mock-${Math.random().toString(36)}`, ...data };
    
    dataStore[table].push(...(Array.isArray(insertedData) ? insertedData : [insertedData]));
    
    return {
      data: insertedData,
      error: null,
    };
  });

  // Mock function to simulate responses for .from().update()
  const mockUpdate = vi.fn().mockImplementation((table: string, data: any) => {
    return {
      data,
      error: null,
    };
  });

  // Mock function to simulate responses for .from().delete()
  const mockDelete = vi.fn().mockImplementation(() => {
    return {
      error: null,
    };
  });

  // Mock function for .from()
  const mockFrom = vi.fn().mockImplementation((table: string) => {
    return {
      select: (columns?: string) => mockSelect(table, columns),
      insert: (data: any) => mockInsert(table, data),
      update: (data: any) => mockUpdate(table, data),
      delete: () => mockDelete(),
      eq: () => ({
        eq: () => ({
          single: () => ({
            data: dataStore[table]?.[0] || null,
            error: null,
          }),
          select: () => mockSelect(table, '*'),
          delete: () => mockDelete(),
          update: (data: any) => mockUpdate(table, data),
        }),
        select: () => mockSelect(table, '*'),
        single: () => ({
          data: dataStore[table]?.[0] || null,
          error: null,
        }),
      }),
      single: () => ({
        data: dataStore[table]?.[0] || null,
        error: null,
      }),
    };
  });

  // Mock function for .auth
  const mockAuth = {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: mockUsers[0], session: { access_token: 'mock-token' } },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: { id: 'new-user', email: 'new@example.com' } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: mockUsers[0], access_token: 'mock-token' } },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  };

  // Mock function for .functions
  const mockFunctions = {
    invoke: vi.fn().mockImplementation((functionName: string, { body }: { body: any }) => {
      if (functionName === 'executeStrategy') {
        // Insert mock execution log
        dataStore['executions'].push({
          id: `exec-${Math.random().toString(36)}`,
          strategy_id: body.strategyId,
          status: 'success',
          created_at: new Date().toISOString(),
          tenant_id: body.tenantId,
        });
        
        return {
          data: { success: true, executionId: 'mock-execution-id' },
          error: null,
        };
      }
      
      return {
        data: { success: true },
        error: null,
      };
    }),
  };

  // Reset data store
  const resetStore = () => {
    Object.keys(dataStore).forEach(key => {
      dataStore[key] = [];
    });
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    functions: mockFunctions,
    // Helper for tests
    _dataStore: dataStore,
    _resetStore: resetStore,
  };
};

// Export the mock client as default
export const mockSupabase = createMockSupabaseClient();

// Export as named export to match the real client
export const supabase = mockSupabase;

export default mockSupabase;
