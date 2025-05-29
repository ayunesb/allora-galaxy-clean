import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies a strategy exists and belongs to the specified tenant
 * @param strategyId The strategy ID to verify
 * @param tenantId The tenant ID for verification
 * @returns The verified strategy or error
 */
export async function verifyStrategy(
  strategyId: string,
  tenantId: string,
): Promise<{
  strategy?: any;
  error?: string;
}> {
  try {
    const { data: strategy, error: strategyError } = await supabase
      .from("strategies")
      .select("id, title, status, completion_percentage")
      .eq("id", strategyId)
      .eq("tenant_id", tenantId)
      .single();

    if (strategyError || !strategy) {
      throw new Error(
        `Strategy not found or access denied: ${strategyError?.message || "Unknown error"}`,
      );
    }

    if (!["approved", "pending"].includes(strategy.status)) {
      throw new Error(
        `Strategy cannot be executed with status: ${strategy.status}`,
      );
    }

    return { strategy };
  } catch (error: any) {
    console.error(`Error verifying strategy ${strategyId}:`, error);
    return { error: error.message || "Unknown error verifying strategy" };
  }
}
