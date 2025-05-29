import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("Generate Strategy Edge Function", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call the edge function with the correct parameters", async () => {
    // Mock successful response
    const mockResponse = {
      data: {
        success: true,
        strategy: {
          id: "mock-strategy-id",
          title: "Test Strategy",
          description: "This is a test strategy",
          tags: ["marketing", "sales"],
          priority: "high",
          due_date: "2023-12-31",
        },
      },
      error: null,
    };

    (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

    // Test data
    const testData = {
      tenant_id: "test-tenant-id",
      company_profile: {
        name: "Test Company",
        industry: "Technology",
        size: "Medium",
        revenue_range: "$1M-$10M",
        website: "https://example.com",
        description: "A test company description",
      },
      persona_profile: {
        name: "Test Persona",
        tone: "Professional",
        goals: ["Increase sales", "Expand market reach"],
      },
      user_id: "test-user-id",
    };

    // Call the edge function
    const result = await supabase.functions.invoke("generateStrategy", {
      body: testData,
    });

    // Verify the function was called with the correct data
    expect(supabase.functions.invoke).toHaveBeenCalledWith("generateStrategy", {
      body: testData,
    });

    // Verify response
    expect(result).toEqual(mockResponse);
    expect(result.data.strategy.title).toBe("Test Strategy");
    expect(result.data.strategy.priority).toBe("high");
  });

  it("should handle errors gracefully", async () => {
    // Mock error response
    const mockErrorResponse = {
      data: null,
      error: {
        message: "Failed to generate strategy",
      },
    };

    (supabase.functions.invoke as any).mockResolvedValue(mockErrorResponse);

    // Call the edge function
    const result = await supabase.functions.invoke("generateStrategy", {
      body: {
        tenant_id: "test-tenant-id",
        company_profile: {},
        persona_profile: {},
        user_id: "test-user-id",
      },
    });

    // Verify error handling
    expect(result.error).toBeDefined();
    expect(result.error.message).toBe("Failed to generate strategy");
  });
});
