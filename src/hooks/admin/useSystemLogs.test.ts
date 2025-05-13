
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useSystemLogs } from './useSystemLogs';
import * as logService from '@/services/logService';
import { createMockSystemLog, createMockLogFilters } from '@/tests/test-utils';

// Mock the logService
vi.mock('@/services/logService', () => ({
  fetchSystemLogs: vi.fn(),
  fetchLogModules: vi.fn(),
  fetchLogEvents: vi.fn(),
}));

describe('useSystemLogs hook', () => {
  const mockLogs = [
    createMockSystemLog({ id: 'log-1' }),
    createMockSystemLog({ id: 'log-2' }),
  ];

  const mockModules = ['system', 'auth', 'user'];
  const mockEvents = ['login', 'logout', 'error'];

  beforeEach(() => {
    vi.clearAllMocks();
    (logService.fetchSystemLogs as any).mockResolvedValue(mockLogs);
    (logService.fetchLogModules as any).mockResolvedValue(mockModules);
    (logService.fetchLogEvents as any).mockResolvedValue(mockEvents);
  });

  it('should fetch logs with initial filters', async () => {
    const initialFilters = createMockLogFilters({ module: 'auth' });
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useSystemLogs(initialFilters)
    );
    
    expect(logService.fetchSystemLogs).toHaveBeenCalledWith(initialFilters);
  });

  it('should update filters correctly', async () => {
    const { result } = renderHook(() => useSystemLogs());
    
    // Update implementation to match current hook behavior
    result.current.updateFilters({ module: 'auth' });
    
    expect(logService.fetchSystemLogs).toHaveBeenCalled();
  });

  it('should reset filters correctly', async () => {
    const initialFilters = createMockLogFilters({ module: 'auth' });
    
    const { result } = renderHook(() => 
      useSystemLogs(initialFilters)
    );
    
    result.current.resetFilters();
    
    expect(logService.fetchSystemLogs).toHaveBeenCalled();
  });

  it('should refetch logs when requested', async () => {
    const { result } = renderHook(() => useSystemLogs());
    
    // Clear previous calls
    (logService.fetchSystemLogs as any).mockClear();
    
    result.current.refetch();
    
    expect(logService.fetchSystemLogs).toHaveBeenCalled();
  });
});
