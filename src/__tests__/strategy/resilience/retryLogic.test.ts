import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeStrategy } from "@/edge/executeStrategy";
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/lib/errors/retryUtils";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock the withRetry function
vi.mock("@/lib/errors/retryUtils", () => ({
  withRetry: vi.fn().mockImplementation(async (fn) => {
    try {
      return await fn();
    } catch (error) {
      throw error;
    }
  }),
}));

// Mock the logSystemEvent function
vi.mock("@/lib/system/logSystemEvent", () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true }),
}));

describe("executeStrategy retry logic", () => {
  const mockInput = {
    strategy_id: "test-strategy-id",
    tenant_id: "test-tenant-id",
    user_id: "test-user-id",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use withRetry for edge function calls", async () => {
    // Mock successful response
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: {
        success: true,
        execution_id: "test-execution-id",
        execution_time: 1.5,
      },
      error: null,
    });

    await executeStrategy(mockInput);

    // Verify withRetry was called
    expect(withRetry).toHaveBeenCalled();

    // Expect supabase.functions.invoke to be called with the right parameters
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "executeStrategy",
      expect.objectContaining({ body: mockInput }),
    );
  });

  it("should handle successful response", async () => {
    // Setup mocks
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: {
        success: true,
        execution_id: "test-execution-id",
        execution_time: 1.5,
      },
      error: null,
    });

    const result = await executeStrategy(mockInput);

    // Verify results
    expect(result.success).toBe(true);
    expect(result.executionId).toBe("test-execution-id");
    expect(result.executionTime).toBe(1.5);
  });

  it("should handle edge function errors", async () => {
    // Setup mocks - withRetry will just pass through the error
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: "Test error" },
    });

    const result = await executeStrategy(mockInput);

    // Verify results - executeStrategy should catch the error and return failure
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
