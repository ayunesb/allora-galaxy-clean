
import { ExecuteStrategyInput } from "@/types/fixed";

export const validStrategyInput: ExecuteStrategyInput = {
  strategyId: 'strategy-123',
  tenantId: 'tenant-123',
  userId: 'user-123'
};

export const invalidInputs = {
  missingStrategyId: {
    tenantId: 'tenant-123',
    userId: 'user-123'
  } as ExecuteStrategyInput,
  
  missingTenantId: {
    strategyId: 'strategy-123',
    userId: 'user-123'
  } as ExecuteStrategyInput,

  empty: undefined
};

export const mockSuccessResponse = {
  data: {
    success: true,
    execution_id: 'exec-123',
    execution_time: 1.5
  },
  error: null
};

export const mockErrorResponse = {
  data: null,
  error: { message: 'Edge function error' }
};

export const mockTemporaryErrorResponse = {
  data: null,
  error: { message: 'Temporary error' }
};

export const mockRetrySuccessResponse = {
  data: {
    success: true,
    execution_id: 'exec-123-retry',
    execution_time: 2.5
  },
  error: null
};
