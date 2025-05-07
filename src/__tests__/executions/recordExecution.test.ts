
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { recordExecution, updateExecution, getExecution } from '@/lib/executions/recordExecution';
import { ExecutionRecordInput, ExecutionStatus } from '@/types/fixed';

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
      tenantId: 'tenant1',
      strategyId: 'strategy1',
      type: 'strategy',
      status: 'pending' as ExecutionStatus
    };
    
    // Act
    const result = await recordExecution(input);
    
    // Assert
    expect(result).toBe('execution1');
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('executions');
    expect(supabaseMock.from().insert).toHaveBeenCalled();
  });
  
  it('should handle missing tenantId', async () => {
    // Arrange
    const input = {
      strategyId: 'strategy1',
      type: 'strategy',
      status: 'pending' as ExecutionStatus
    } as ExecutionRecordInput;
    
    // Act
    const result = await recordExecution(input);
    
    // Assert
    expect(result).toBeNull();
  });
  
  it('should handle missing type', async () => {
    // Arrange
    const input = {
      tenantId: 'tenant1',
      strategyId: 'strategy1',
      status: 'pending' as ExecutionStatus
    } as ExecutionRecordInput;
    
    // Act
    const result = await recordExecution(input);
    
    // Assert
    expect(result).toBeNull();
  });
  
  it('should handle database errors', async () => {
    // Arrange
    const input: ExecutionRecordInput = {
      tenantId: 'tenant1',
      strategyId: 'strategy1',
      type: 'strategy',
      status: 'pending' as ExecutionStatus
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
      tenantId: 'tenant1',
      status: 'success' as ExecutionStatus,
      output: { result: 'completed' }
    };
    
    // Act
    const result = await updateExecution(executionId, updates);
    
    // Assert
    expect(result).toBe(true);
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('executions');
    expect(supabaseMock.from().update).toHaveBeenCalled();
  });
  
  it('should retrieve an execution successfully', async () => {
    // Arrange
    const executionId = 'execution1';
    
    // Act
    const result = await getExecution(executionId);
    
    // Assert
    expect(result).toEqual({ id: 'execution1' });
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('executions');
    expect(supabaseMock.from().select).toHaveBeenCalledWith('*');
  });
});
