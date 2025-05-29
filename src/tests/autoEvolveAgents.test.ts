import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { autoEvolveAgents } from "@/lib/agents/evolution/autoEvolveAgents";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("@/lib/system/logSystemEvent", () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true }),
}));

// Helper to mock the behavior of getAgentsForEvolution
function mockGetAgentsForEvolution() {
  return [
    {
      id: "agent-1",
      version: "1.0",
      prompt: "Test prompt",
      upvotes: 3,
      downvotes: 10,
      created_at: "2023-01-01T00:00:00Z",
      plugin_id: "plugin-1",
    },
    {
      id: "agent-2",
      version: "1.0",
      prompt: "Test prompt 2",
      upvotes: 20,
      downvotes: 5,
      created_at: "2023-05-01T00:00:00Z",
      plugin_id: "plugin-2",
    },
  ];
}

describe("autoEvolveAgents", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock responses
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "agent-1",
                upvotes: 3,
                downvotes: 10,
                created_at: "2023-01-01T00:00:00Z",
                plugin_id: "plugin-1",
                prompt: "Test prompt",
              },
              {
                id: "agent-2",
                upvotes: 20,
                downvotes: 5,
                created_at: "2023-05-01T00:00:00Z",
                plugin_id: "plugin-2",
                prompt: "Test prompt 2",
              },
            ],
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "new-agent-id",
              plugin_id: "plugin-1",
              prompt: "Evolved prompt",
              version: 2,
              isActive: true,
              created_at: "2023-06-01T00:00:00Z",
            },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    } as any);
  });

  it("should auto-evolve agents that need improvement", async () => {
    const mockAgents = mockGetAgentsForEvolution();
    const tenantId = "test-tenant-id";

    const result = await autoEvolveAgents(mockAgents, tenantId);

    expect(result.success).toBe(true);
    expect(result.evolved).toBeGreaterThan(0);
    expect(logSystemEvent).toHaveBeenCalled();
  });

  it("should handle empty agent list", async () => {
    const emptyAgents: { id: string; version: string; prompt: string }[] = [];
    const tenantId = "test-tenant-id";

    const result = await autoEvolveAgents(emptyAgents, tenantId);

    expect(result.success).toBe(true);
    expect(result.evolved).toBe(0);
    expect(result.message).toContain("No agents needed evolution");
  });

  it("should handle database errors", async () => {
    // Mocking a situation where something goes wrong
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: new Error("Database error"),
          }),
        }),
      }),
    } as any);

    const mockAgents = mockGetAgentsForEvolution();
    const tenantId = "test-tenant-id";

    const result = await autoEvolveAgents(mockAgents, tenantId);

    // Should still return a valid result even when encountering errors
    expect(result.success).toBeDefined();
    expect(result.error).toBeDefined();
  });
});
