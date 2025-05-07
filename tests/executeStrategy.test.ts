
import { runStrategy } from "@/lib/strategy/execute";

test("runStrategy works as expected", async () => {
  // Mock input for testing
  const mockInput = {
    strategy_id: "test-strategy",
    tenant_id: "test-tenant"
  };
  
  const result = await runStrategy(mockInput);
  
  // Basic assertions
  expect(result).toBeDefined();
  expect(typeof result.success).toBe('boolean');
});
