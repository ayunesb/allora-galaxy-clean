import { runStrategy } from "@/lib/strategy/runStrategy";

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  return await runStrategy(input);
}
