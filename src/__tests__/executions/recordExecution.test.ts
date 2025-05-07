
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { recordExecution, updateExecution, getExecution } from '@/lib/executions/recordExecution';
import { ExecutionRecordInput } from '@/lib/executions/recordExecution';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => ({
        data: { id: 'execution1' },
        error: null
      })),
      maybeSingle: vi.fn().mockImplementation(() => ({
        data: { id: 'execution1' },
        error: null
      }))
    }))
  }
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue('log1')
}));

describe('Execution Recording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should record an execution successfully', async () => {
    // Arrange
    const input: ExecutionRecordInput = {
      tenant_id: 'tenant1',
      strategy_id: 'strategy1',
      type: 'strategy',
      status: 'pending'
    };
    
    // Act
    const result = await recordExecution(input);
    
    // Assert
    expect(result).toBe('execution1');
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('executions');
    expect(supabaseMock.from().insert).toHaveBeenCalled();
  });
  
  it('should handle missing tenant_id', async () => {
    // Arrange
    const input = {
      strategy_id: 'strategy1',
      type: 'strategy',
      status: 'pending'
    } as ExecutionRecordInput;
    
    // Act
    const result = await recordExecution(input);
    
    // Assert
    expect(result).toBeNull();
  });
  
  it('should handle missing type', async () => {
    // Arrange
    const input = {
      tenant_id: 'tenant1',
      strategy_id: 'strategy1',
      status: 'pending'
    } as ExecutionRecordInput;
    
    // Act
    const result = await recordExecution(input);
    
    // Assert
    expect(result).toBeNull();
  });
  
  it('should handle database errors', async () => {
    // Arrange
    const input: ExecutionRecordInput = {
      tenant_id: 'tenant1',
      strategy_id: 'strategy1',
      type: 'strategy',
      status: 'pending'
    };
    
    // Mock database error
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().insert().select().single.mockImplementationOnce(() => ({
      data: null,
      error: { message: 'Database error' }
    }));
    
    // Act
    const result = await recordExecution(input);
    
    // Assert
    expect(result).toBeNull();
    const logSystemEvent = require('@/lib/system/logSystemEvent').logSystemEvent;
    expect(logSystemEvent).toHaveBeenCalled();
  });
  
  it('should update an execution successfully', async () => {
    // Arrange
    const executionId = 'execution1';
    const updates = {
      tenant_id: 'tenant1',
      status: 'success',
      output: { data: 'test' }
    };
    
    // Act
    const result = await updateExecution(executionId, updates);
    
    // Assert
    expect(result).toBe(true);
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('executions');
    expect(supabaseMock.from().update).toHaveBeenCalled();
    expect(supabaseMock.from().update().eq).toHaveBeenCalledWith('id', executionId);
  });
  
  it('should handle missing execution_id in update', async () => {
    // Arrange
    const executionId = '';
    const updates = {
      tenant_id: 'tenant1',
      status: 'success'
    };
    
    // Act
    const result = await updateExecution(executionId, updates);
    
    // Assert
    expect(result).toBe(false);
  });
  
  it('should handle database errors in update', async () => {
    // Arrange
    const executionId = 'execution1';
    const updates = {
      tenant_id: 'tenant1',
      status: 'success'
    };
    
    // Mock database error
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().update().eq.mockImplementationOnce(() => ({
      error: { message: 'Database error' }
    }));
    
    // Act
    const result = await updateExecution(executionId, updates);
    
    // Assert
    expect(result).toBe(false);
  });
  
  it('should get an execution successfully', async () => {
    // Arrange
    const executionId = 'execution1';
    
    // Act
    const result = await getExecution(executionId);
    
    // Assert
    expect(result).toEqual({ id: 'execution1' });
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('executions');
    expect(supabaseMock.from().select).toHaveBeenCalledWith('*');
    expect(supabaseMock.from().select().eq).toHaveBeenCalledWith('id', executionId);
  });
  
  it('should handle missing execution_id in get', async () => {
    // Arrange
    const executionId = '';
    
    // Act
    const result = await getExecution(executionId);
    
    // Assert
    expect(result).toBeNull();
  });
  
  it('should handle database errors in get', async () => {
    // Arrange
    const executionId = 'execution1';
    
    // Mock database error
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().select().eq().maybeSingle.mockImplementationOnce(() => ({
      data: null,
      error: { message: 'Database error' }
    }));
    
    // Act
    const result = await getExecution(executionId);
    
    // Assert
    expect(result).toBeNull();
  });
});
