// Mock data for strategy tests

export const validStrategyInput = {
  strategyId: "strategy-123",
  tenantId: "tenant-123",
  userId: "user-123",
};

export const mockSuccessResponse = {
  data: {
    success: true,
    execution_id: "exec-123",
    execution_time: 1.5,
  },
  error: null,
};

export const mockErrorResponse = {
  data: null,
  error: {
    message: "Edge function error",
    status: 500,
  },
};

export const mockTemporaryErrorResponse = {
  data: null,
  error: {
    message: "Temporary service unavailable",
    status: 503,
  },
};

export const mockRetrySuccessResponse = {
  data: {
    success: true,
    execution_id: "exec-123-retry",
    execution_time: 1.2,
  },
  error: null,
};

export const mockStrategyData = {
  id: "strategy-123",
  title: "Test Strategy",
  description: "A test strategy",
  status: "active",
  tenant_id: "tenant-123",
  created_by: "user-123",
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-02T00:00:00.000Z",
};

export const mockEdgeEnvironment = {
  SUPABASE_URL: "https://test-supabase-project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  OPENAI_API_KEY: "test-openai-key",
};
