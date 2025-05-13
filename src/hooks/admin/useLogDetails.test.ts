
import { renderHook, act } from '@/tests/test-utils';
import { useLogDetails } from './useLogDetails';
import { supabase } from '@/lib/supabase';
import { createMockSystemLog, createMockAuditLog } from '@/tests/test-utils';
import { vi } from 'vitest';

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  },
}));

describe('useLogDetails hook', () => {
  const mockSystemLog = createMockSystemLog();
  const mockAuditLog = createMockAuditLog();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should fetch a system log correctly', async () => {
    // Set up mocks for a system log fetch
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.maybeSingle as any)
      .mockResolvedValueOnce({ data: mockSystemLog, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    
    const logId = 'sys-123';
    const { result, waitForNextUpdate } = renderHook(() => useLogDetails(logId));
    
    await waitForNextUpdate();
    
    expect(supabase.from).toHaveBeenCalledWith('system_logs');
    expect(supabase.eq).toHaveBeenCalledWith('id', logId);
    expect(result.current.logData).toEqual(mockSystemLog);
    expect(result.current.logType).toBe('system');
    expect(result.current.isSystemLog).toBe(true);
  });
  
  it('should fetch an audit log correctly', async () => {
    // Set up mocks for an audit log fetch
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.maybeSingle as any)
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
      .mockResolvedValueOnce({ data: mockAuditLog, error: null });
    
    const logId = 'audit-123';
    const { result, waitForNextUpdate } = renderHook(() => useLogDetails(logId));
    
    await waitForNextUpdate();
    
    expect(supabase.from).toHaveBeenCalledWith('system_logs');
    expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    expect(supabase.eq).toHaveBeenCalledWith('id', logId);
    expect(result.current.logData).toEqual(mockAuditLog);
    expect(result.current.logType).toBe('audit');
    expect(result.current.isSystemLog).toBe(false);
  });
  
  it('should handle the case when no log is found', async () => {
    // Set up mocks for no log found
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.maybeSingle as any)
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    
    const logId = 'non-existent';
    const { result, waitForNextUpdate } = renderHook(() => useLogDetails(logId));
    
    await waitForNextUpdate();
    
    expect(result.current.logData).toBeUndefined();
    expect(result.current.logType).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });
  
  it('should toggle view correctly', async () => {
    // Set up mocks for a system log fetch
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.maybeSingle as any)
      .mockResolvedValueOnce({ data: mockSystemLog, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    
    const { result, waitForNextUpdate } = renderHook(() => useLogDetails('sys-123'));
    
    await waitForNextUpdate();
    
    expect(result.current.currentView).toBe('details');
    
    act(() => {
      result.current.toggleView('raw');
    });
    
    expect(result.current.currentView).toBe('raw');
  });
  
  it('should handle transform dialog correctly', async () => {
    // Set up mocks for a system log fetch
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.maybeSingle as any)
      .mockResolvedValueOnce({ data: mockSystemLog, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    
    const { result, waitForNextUpdate } = renderHook(() => useLogDetails('sys-123'));
    
    await waitForNextUpdate();
    
    expect(result.current.transformDialogOpen).toBe(false);
    
    act(() => {
      result.current.openTransformDialog();
    });
    
    expect(result.current.transformDialogOpen).toBe(true);
    
    act(() => {
      result.current.closeTransformDialog();
    });
    
    expect(result.current.transformDialogOpen).toBe(false);
  });
});
