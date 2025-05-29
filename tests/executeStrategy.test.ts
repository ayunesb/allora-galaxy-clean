import { expect, test, vi, beforeEach, describe } from "vitest";
import { runStrategy } from "@/lib/strategy/runStrategy";

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe("runStrategy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("handles valid input successfully", async () => {
    // Mock input for testing
    const mockInput = {
      strategy_id: "test-strategy",
      tenant_id: "test-tenant",
      options: { param1: "value1" }
    };

    // Mock supabase.functions.invoke to return a successful result
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.functions.invoke.mockResolvedValue({
      data: { execution_id: "exec-123" },
      error: null
    });

    // Execute the function
    const result = await runStrategy(mockInput);

    // Verify the result
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.execution_id).toBeDefined();
  });

  test("validates required inputs", async () => {
    // Missing strategy_id
    const result1 = await runStrategy({
      strategy_id: "",
      tenant_id: "test-tenant"
    });

    expect(result1.success).toBe(false);
    expect(result1.error).toContain('Strategy ID');

    // Missing tenant_id
    const result2 = await runStrategy({
      strategy_id: "test-strategy",
      tenant_id: ""
    });

    expect(result2.success).toBe(false);
    expect(result2.error).toContain('Tenant ID');
  });

  test("handles errors gracefully", async () => {
    // Mock an error in the supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.functions.invoke.mockImplementation(() => {
      throw new Error("Test error");
    });

    const mockInput = {
      strategy_id: "test-strategy",
      tenant_id: "test-tenant"
    };

    const result = await runStrategy(mockInput);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Test error');
  });
});
