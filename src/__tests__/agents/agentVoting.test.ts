import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  castVote,
  upvoteAgentVersion,
  downvoteAgentVersion,
} from "@/lib/agents/voting";
import { VoteType } from "@/types/shared";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: "test-user-id" },
          },
        },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock getUserVote function
vi.mock("@/lib/agents/voting/voteOnAgentVersion", async () => {
  // Return a mocked module
  return {
    getUserVote: vi.fn().mockResolvedValue({
      success: true,
      hasVoted: false,
      vote: null,
    }),
    voteOnAgentVersion: vi.fn().mockResolvedValue({
      success: true,
      upvotes: 5,
      downvotes: 2,
    }),
  };
});

describe("Agent Voting System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("castVote", () => {
    it("should handle a new upvote", async () => {
      // Mock Supabase response for updated agent version
      const supabaseMock = await import("@/integrations/supabase/client");
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { upvotes: 5, downvotes: 2 },
              error: null,
            }),
        }),
      });
      vi.mocked(supabaseMock.supabase.from).mockImplementation((table) => {
        if (table === "agent_versions") {
          return { select: mockSelect } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          insert: vi
            .fn()
            .mockResolvedValue({ data: { id: "new-vote" }, error: null }),
        } as any;
      });

      // Execute the vote
      const result = await castVote("agent-123", "upvote" as VoteType);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.upvotes).toBe(5);
      expect(result.downvotes).toBe(2);
    });

    it("should return error if not logged in", async () => {
      // Mock auth to return no session
      const supabaseMock = await import("@/integrations/supabase/client");
      vi.mocked(supabaseMock.supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
      } as any);

      const result = await castVote("agent-123", "upvote" as VoteType);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be logged in to vote");
    });

    it("should handle errors gracefully", async () => {
      // Mock Supabase to throw error
      const supabaseMock = await import("@/integrations/supabase/client");
      vi.mocked(supabaseMock.supabase.from).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const result = await castVote("agent-123", "upvote" as VoteType);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to cast vote");
    });
  });

  describe("upvoteAgentVersion and downvoteAgentVersion", () => {
    it("should call castVote with upvote type", async () => {
      // Mock castVote
      const mockCastVote = vi.fn().mockResolvedValue({
        success: true,
        upvotes: 5,
        downvotes: 2,
      });

      // Replace the imported castVote with our mock
      const originalCastVote = castVote;
      vi.mocked(castVote as any).mockImplementation(mockCastVote);

      await upvoteAgentVersion("agent-123", "Great agent!");

      expect(mockCastVote).toHaveBeenCalledWith(
        "agent-123",
        "upvote",
        "Great agent!",
      );

      // Restore original mock implementation
      vi.mocked(castVote as any).mockImplementation(originalCastVote);
    });

    it("should call castVote with downvote type", async () => {
      // Mock castVote
      const mockCastVote = vi.fn().mockResolvedValue({
        success: true,
        upvotes: 4,
        downvotes: 3,
      });

      // Replace the imported castVote with our mock
      const originalCastVote = castVote;
      vi.mocked(castVote as any).mockImplementation(mockCastVote);

      await downvoteAgentVersion("agent-123", "Needs improvement");

      expect(mockCastVote).toHaveBeenCalledWith(
        "agent-123",
        "downvote",
        "Needs improvement",
      );

      // Restore original mock implementation
      vi.mocked(castVote as any).mockImplementation(originalCastVote);
    });
  });
});
