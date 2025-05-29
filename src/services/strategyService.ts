import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch strategies for a specific tenant
 * @param tenantId The tenant ID to fetch strategies for
 * @returns Promise with array of strategies
 */
export const fetchStrategies = async (tenantId?: string) => {
  if (!tenantId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("strategies")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching strategies:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in fetchStrategies:", err);
    return [];
  }
};

/**
 * Fetch a specific strategy by ID
 * @param strategyId Strategy ID
 * @returns Promise with strategy data or null
 */
export const fetchStrategyById = async (strategyId: string) => {
  try {
    const { data, error } = await supabase
      .from("strategies")
      .select("*")
      .eq("id", strategyId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching strategy:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in fetchStrategyById:", err);
    return null;
  }
};

/**
 * Update the status of a strategy
 * @param strategyId Strategy ID to update
 * @param status New status value
 * @returns Promise with success status
 */
export const updateStrategyStatus = async (
  strategyId: string,
  status: string,
) => {
  try {
    const { error } = await supabase
      .from("strategies")
      .update({ status })
      .eq("id", strategyId);

    if (error) {
      console.error("Error updating strategy status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateStrategyStatus:", err);
    return { success: false, error: err.message };
  }
};
