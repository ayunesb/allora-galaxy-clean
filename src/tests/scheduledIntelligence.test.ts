import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: {
          success: true,
          tenants_processed: 3,
          kpis_analyzed: 42,
          agents_evolved: 2,
          benchmarks_updated: 3,
        },
        error: null,
      }),
    },
  },
}));

describe("Scheduled Intelligence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should invoke the scheduledIntelligence function", async () => {
    const { data, error } = await supabase.functions.invoke(
      "scheduledIntelligence",
      {
        body: {},
      },
    );

    expect(error).toBeNull();
    expect(data).toEqual({
      success: true,
      tenants_processed: 3,
      kpis_analyzed: 42,
      agents_evolved: 2,
      benchmarks_updated: 3,
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "scheduledIntelligence",
      { body: {} },
    );
  });

  it("should allow processing a specific tenant", async () => {
    await supabase.functions.invoke("scheduledIntelligence", {
      body: { tenant_id: "specific-tenant" },
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "scheduledIntelligence",
      { body: { tenant_id: "specific-tenant" } },
    );
  });
});
