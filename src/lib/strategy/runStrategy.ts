import { supabase } from "@/integrations/supabase/client";

export async function runStrategy(input?: {
  strategy_id?: string;
  tenant_id?: string;
  options?: Record<string, any>;
}): Promise<{ success: boolean; execution_id?: string; error?: string }> {
  if (!input || !input.tenant_id) {
    return { success: false, error: "Tenant ID is required" };
  }
  if (!input.strategy_id) {
    return { success: false, error: "Strategy ID is required" };
  }
  try {
    const { data, error } = await supabase.functions.invoke("run-strategy", {
      body: { strategy_id: input.strategy_id, tenant_id: input.tenant_id, options: input.options || {} },
    });
    if (error) throw error;
    return { success: true, execution_id: data?.execution_id || "" };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}
