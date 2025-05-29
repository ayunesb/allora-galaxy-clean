// Test setup file contains configuration for strategy tests

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { runStrategy } from "../../../lib/strategy/runStrategy";

// Mock supabase client
vi.mock("../../../integrations/supabase/client", () => {
  const invokeFunction = vi.fn().mockImplementation(() => ({
    data: {
      execution_id: "mock-execution-id",
      execution_time: 123,
      details: {
        success: true,
        plugins_executed: 2,
      },
    },
    error: null,
  }));

  const supabaseMock = {
    functions: {
      invoke: invokeFunction,
    },
  };

  return {
    supabase: supabaseMock,
  };
});

// Mock logSystemEvent
vi.mock("../../../lib/system/logSystemEvent", () => {
  return {
    logSystemEvent: vi.fn().mockResolvedValue(true),
  };
});

// Common setup for strategy tests
const setupStrategyTest = () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  return {
    mockInput: {
      strategyId: "test-strategy-id",
      tenantId: "test-tenant-id",
      userId: "test-user-id",
      options: {
        test: "option",
      },
    },
  };
};

// Export a setupTests function that other test files can import
export const setupTests = setupStrategyTest;

export {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  setupStrategyTest,
  runStrategy,
};
