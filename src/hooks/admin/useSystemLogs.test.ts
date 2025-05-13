
import { renderHook, act } from '@/tests/test-utils';
import { useSystemLogs } from './useSystemLogs';
import * as logService from '@/services/logService';
import { createMockSystemLog, createMockLogFilters } from '@/tests/test-utils';

// Mock the logService
jest.mock('@/services/logService', () => ({
  fetchSystemLogs: jest.fn(),
  fetchLogModules: jest.fn(),
  fetchLogEvents: jest.fn(),
}));

describe('useSystemLogs hook', () => {
  const mockLogs = [
    createMockSystemLog({ id: 'log-1' }),
    createMockSystemLog({ id: 'log-2' }),
  ];

  const mockModules = ['system', 'auth', 'user'];
  const mockEvents = ['login', 'logout', 'error'];

  beforeEach(() => {
    jest.clearAllMocks();
    (logService.fetchSystemLogs as jest.Mock).mockResolvedValue(mockLogs);
    (logService.fetchLogModules as jest.Mock).mockResolvedValue(mockModules);
    (logService.fetchLogEvents as jest.Mock).mockResolvedValue(mockEvents);
  });

  it('should fetch logs with initial filters', async () => {
    const initialFilters = createMockLogFilters({ module: 'auth' });
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useSystemLogs(initialFilters)
    );
    
    await waitForNextUpdate();
    
    expect(logService.fetchSystemLogs).toHaveBeenCalledWith(initialFilters);
    expect(result.current.logs).toEqual(mockLogs);
    expect(result.current.filters).toEqual(initialFilters);
  });

  it('should update filters correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSystemLogs());
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.updateFilters({ module: 'auth' });
    });
    
    await waitForNextUpdate();
    
    expect(logService.fetchSystemLogs).toHaveBeenCalledWith({ module: 'auth' });
    expect(result.current.filters).toEqual({ module: 'auth' });
  });

  it('should reset filters correctly', async () => {
    const initialFilters = createMockLogFilters({ module: 'auth' });
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useSystemLogs(initialFilters)
    );
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.resetFilters();
    });
    
    await waitForNextUpdate();
    
    expect(logService.fetchSystemLogs).toHaveBeenCalledWith({});
    expect(result.current.filters).toEqual({});
  });

  it('should fetch modules and events', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSystemLogs());
    
    await waitForNextUpdate();
    
    expect(logService.fetchLogModules).toHaveBeenCalled();
    expect(logService.fetchLogEvents).toHaveBeenCalled();
    expect(result.current.modules).toEqual(mockModules);
    expect(result.current.events).toEqual(mockEvents);
  });

  it('should refetch logs when requested', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSystemLogs());
    
    await waitForNextUpdate();
    
    // Clear previous calls
    (logService.fetchSystemLogs as jest.Mock).mockClear();
    
    act(() => {
      result.current.refetch();
    });
    
    await waitForNextUpdate();
    
    expect(logService.fetchSystemLogs).toHaveBeenCalled();
  });
});
