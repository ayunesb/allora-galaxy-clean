import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordExecution } from "@/lib/executions/recordExecution";
import { ExecutionRecordInput } from "@/types/execution";
import { supabase } from "@/integrations/supabase/client";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: "test-execution-id" },
              error: null,
            }),
          ),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { id: "test-execution-id", status: "completed" },
                error: null,
              }),
            ),
          })),
        })),
      })),
    })),
  },
}));

describe("recordExecution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should record an execution successfully", async () => {
    const executionData: ExecutionRecordInput = {
      tenantId: "tenant-123",
      status: "success",
      type: "strategy",
      strategyId: "strategy-123",
      executedBy: "user-123",
      input: { data: "input" },
      output: { result: "output" },
    };

    const result = await recordExecution(executionData);

    expect(result).toMatchObject({
      success: true,
      data: { id: "test-execution-id" },
    });

    expect(supabase.from).toHaveBeenCalledWith("executions");
    expect(supabase.from("executions").insert).toHaveBeenCalledWith({
      tenant_id: "tenant-123",
      status: "success",
      type: "strategy",
      strategy_id: "strategy-123",
      executed_by: "user-123",
      input: { data: "input" },
      output: { result: "output" },
    });
  });

  it("should handle errors gracefully", async () => {
    // Set up the mock to reject
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: new Error("Database error"),
            }),
          ),
        })),
      })),
    } as any);

    const executionData: ExecutionRecordInput = {
      tenantId: "tenant-123",
      status: "failure",
      type: "plugin",
      error: "Something went wrong",
    };

    const result = await recordExecution(executionData);

    expect(result).toMatchObject({
      success: false,
    });
  });
});
