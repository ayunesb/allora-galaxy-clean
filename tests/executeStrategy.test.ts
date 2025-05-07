
import { expect, test, vi, beforeEach } from "vitest";
import { runStrategy } from "@/lib/strategy/runStrategy";

// Mock the supabase client
vi.mock('@/integrations/supabase/client');

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

test("runStrategy handles valid input successfully", async () => {
  // Mock input for testing
  const mockInput = {
    strategy_id: "test-strategy",
    tenant_id: "test-tenant",
    options: { param1: "value1" }
  };
  
  // Execute the function
  const result = await runStrategy(mockInput);
  
  // Verify the result
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.execution_id).toBeDefined();
});

test("runStrategy validates required inputs", async () => {
  // Missing strategy_id
  const result1 = await runStrategy({ 
    strategy_id: "", 
    tenant_id: "test-tenant" 
  });
  
  expect(result1.success).toBe(false);
  expect(result1.error).toContain('Strategy ID');
  
  // Missing tenant_id
  const result2 = await runStrategy({ 
    strategy_id: "test-strategy", 
    tenant_id: "" 
  });
  
  expect(result2.success).toBe(false);
  expect(result2.error).toContain('Tenant ID');
});

test("runStrategy handles errors gracefully", async () => {
  // Mock an error in the supabase client
  const mockSupabase = await import('@/integrations/supabase/client');
  mockSupabase.supabase.functions.invoke = vi.fn().mockImplementation(() => {
    throw new Error("Test error");
  });
  
  const mockInput = {
    strategy_id: "test-strategy",
    tenant_id: "test-tenant"
  };
  
  const result = await runStrategy(mockInput);
  
  expect(result.success).toBe(false);
  expect(result.error).toContain('Test error');
});
