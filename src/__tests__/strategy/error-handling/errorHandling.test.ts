import { describe, it, expect, vi } from "vitest";
import { runStrategy } from "@/lib/strategy/runStrategy";
import { setupTests } from "../setup/testSetup";

// Mock dependencies
vi.mock("@/lib/system/logSystemEvent", () => ({
  logSystemEvent: vi
    .fn()
    .mockResolvedValue({ success: true, id: "mock-log-id" }),
  default: vi.fn().mockResolvedValue({ success: true, id: "mock-log-id" }),
  logSystemError: vi
    .fn()
    .mockResolvedValue({ success: true, id: "mock-error-log-id" }),
  logSystemInfo: vi
    .fn()
    .mockResolvedValue({ success: true, id: "mock-info-log-id" }),
}));

describe("runStrategy Error Handling", () => {
  setupTests();

  it("should handle Supabase edge function errors", async () => {
    // Arrange
    const validStrategyInput = {
      strategyId: "strategy-123",
      tenantId: "tenant-123",
      userId: "user-123",
    };

    const supabaseMock = await import("@/integrations/supabase/client");
    vi.mocked(supabaseMock.supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: "Edge function error" },
    });

    // Act
    const result = await runStrategy(validStrategyInput);

    // Assert
    expect(result.success).toBe(false);
  });

  it("should continue even if logSystemEvent fails", async () => {
    // Arrange
    const validStrategyInput = {
      strategyId: "strategy-123",
      tenantId: "tenant-123",
      userId: "user-123",
    };

    const logSystemEventModule = await import("@/lib/system/logSystemEvent");

    // Override the mock for this specific test
    vi.mocked(logSystemEventModule.default).mockRejectedValueOnce(
      new Error("Logging failed"),
    );

    const supabaseMock = await import("@/integrations/supabase/client");
    vi.mocked(supabaseMock.supabase.functions.invoke).mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    // Act - should not throw despite log failure
    const result = await runStrategy(validStrategyInput);

    // Assert
    expect(result.success).toBe(true); // Should still succeed despite logging failure
  });
});
