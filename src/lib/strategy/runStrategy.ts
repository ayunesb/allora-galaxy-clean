
import { ExecuteStrategyInput, ExecuteStrategyResult } from "./types";
import { supabase } from "@/integrations/supabase/client";

export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    const { strategy_id, tenant_id, user_id } = input;
    
    // Get the strategy
    const { data: strategy, error: strategyError } = await supabase
      .from("strategies")
      .select("*")
      .eq("id", strategy_id)
      .single();
      
    if (strategyError || !strategy) {
      return { 
        success: false, 
        error: strategyError?.message || "Strategy not found" 
      };
    }
    
    // Record the execution
    await supabase
      .from("executions")
      .insert({
        tenant_id: tenant_id || strategy.tenant_id,
        strategy_id,
        executed_by: user_id,
        type: 'strategy',
        status: 'success'
      });
    
    return {
      success: true,
      message: "Strategy executed successfully",
      data: { strategy_id }
    };
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred"
    };
  }
}
