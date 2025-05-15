
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimizedStrategyData } from '@/hooks/useOptimizedStrategyData';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'strategy-1', name: 'Test Strategy' } })),
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [{ id: 'execution-1' }] }))
            })),
          })),
          order: vi.fn(() => Promise.resolve({ data: [{ id: 'version-1' }] }))
        }))
      }))
    }
  };
});

// Mock toast
vi.mock('@/lib/notifications/toast', () => {
  return {
    toast: {
      error: vi.fn(),
      success: vi.fn()
    }
  };
});

// Setup for react-query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOptimizedStrategyData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('fetches strategy data on initialization', async () => {
    const { result, waitFor } = renderHook(() => useOptimizedStrategyData('strategy-1'), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => !result.current.isLoading);
    
    expect(result.current.strategy.data).toBeDefined();
    expect(result.current.versions.data).toBeDefined();
    expect(result.current.executions.data).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });
  
  it('provides a refetch function that refreshes all data', async () => {
    const { result, waitFor } = renderHook(() => useOptimizedStrategyData('strategy-1'), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => !result.current.isLoading);
    
    expect(result.current.refetch).toBeInstanceOf(Function);
    
    // Mock refetch functions
    result.current.strategy.refetch = vi.fn(() => Promise.resolve({}));
    result.current.versions.refetch = vi.fn(() => Promise.resolve({}));
    result.current.executions.refetch = vi.fn(() => Promise.resolve({}));
    
    await result.current.refetch();
    
    expect(result.current.strategy.refetch).toHaveBeenCalledTimes(1);
    expect(result.current.versions.refetch).toHaveBeenCalledTimes(1);
    expect(result.current.executions.refetch).toHaveBeenCalledTimes(1);
  });
});
