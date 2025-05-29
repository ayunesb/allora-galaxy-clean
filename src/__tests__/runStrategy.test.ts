import { expect, test, vi, beforeEach, describe } from "vitest";
import { runStrategy } from "@/lib/strategy/runStrategy";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

const { supabase } = require("@/integrations/supabase/client");

describe("runStrategy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("handles valid input successfully", async () => {
    supabase.functions.invoke.mockResolvedValueOnce({
      data: { execution_id: "exec-123" },
      error: null
    });

    const result = await runStrategy({
      strategy_id: "strategy-1",
      tenant_id: "tenant-1",
      options: { foo: "bar" }
    });

    expect(result.success).toBe(true);
    expect(result.execution_id).toBe("exec-123");
  });

  test("validates required inputs", async () => {
    const result1 = await runStrategy({
      strategy_id: "",
      tenant_id: "tenant-1"
    });
    expect(result1.success).toBe(false);
    expect(result1.error).toContain("Strategy ID");

    const result2 = await runStrategy({
      strategy_id: "strategy-1",
      tenant_id: ""
    });
    expect(result2.success).toBe(false);
    expect(result2.error).toContain("Tenant ID");
  });

  test("handles errors gracefully", async () => {
    supabase.functions.invoke.mockImplementation(() => {
      throw new Error("Test failure");
    });

    const result = await runStrategy({
      strategy_id: "strategy-1",
      tenant_id: "tenant-1"
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Test failure");
  });
});
