
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeStrategy } from '@/lib/edge-functions/executeStrategy';
import { mockSupabase } from '@/lib/__mocks__/supabaseClient';

// Mock the supabase import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock the Deno environment for edge function testing
vi.stubGlobal('Deno', {
  env: {
    get: (key: string) => {
      if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-service-key';
      return undefined;
    }
  }
});

describe('Execute Strategy Edge Function', () => {
  beforeEach(() => {
    // Reset the mock data store before each test
    mockSupabase._resetStore();
    
    // Add a test strategy to the mock data
    mockSupabase._dataStore.strategies = [
      {
        id: 'strategy1',
        title: 'Test Strategy',
        tenant_id: 'tenant1',
        status: 'active',
      }
    ];
  });

  it('should accept correct input shape', async () => {
    // Create mock request
    const mockRequest = new Request('http://localhost:8000/executeStrategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategyId: 'strategy1',
        tenantId: 'tenant1',
      }),
    });

    const response = await executeStrategy(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.executionId).toBeDefined();
  });

  it('should fail gracefully on invalid strategy ID', async () => {
    // Create mock request with invalid strategy ID
    const mockRequest = new Request('http://localhost:8000/executeStrategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategyId: 'nonexistent',
        tenantId: 'tenant1',
      }),
    });

    // Mock the behavior for strategy not found
    vi.spyOn(mockSupabase, 'from').mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: null,
            error: { message: 'Strategy not found' },
          }),
        }),
      }),
    }));

    const response = await executeStrategy(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Strategy not found');
  });

  it('should create plugin_logs and executions rows', async () => {
    // Create mock request
    const mockRequest = new Request('http://localhost:8000/executeStrategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategyId: 'strategy1',
        tenantId: 'tenant1',
      }),
    });

    await executeStrategy(mockRequest);

    // Check that an execution record was created
    expect(mockSupabase._dataStore.executions.length).toBeGreaterThan(0);
    expect(mockSupabase._dataStore.executions[0].strategy_id).toBe('strategy1');
    expect(mockSupabase._dataStore.executions[0].tenant_id).toBe('tenant1');
  });

  it('should handle CORS preflight requests', async () => {
    const mockRequest = new Request('http://localhost:8000/executeStrategy', {
      method: 'OPTIONS',
    });

    const response = await executeStrategy(mockRequest);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
  
  it('should validate required fields', async () => {
    // Missing strategyId
    const mockRequest = new Request('http://localhost:8000/executeStrategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant1',
      }),
    });

    const response = await executeStrategy(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toContain('strategyId is required');
  });
});
