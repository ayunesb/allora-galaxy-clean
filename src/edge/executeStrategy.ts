
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from "@/lib/strategy/types";

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  return await runStrategy(input);
}
