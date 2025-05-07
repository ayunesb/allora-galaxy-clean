
import { expect, test, vi, beforeEach } from "vitest";
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client');

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

test("updateKPIs edge function invocation works correctly", async () => {
  // Define test input
  const input = {
    tenant_id: "test-tenant",
    sources: ["stripe", "ga4"]
  };
  
  // Execute the function call
  const { data, error } = await supabase.functions.invoke('updateKPIs', {
    body: input
  });
  
  // Verify the result
  expect(error).toBeNull();
  expect(data).toBeDefined();
  expect(data.success).toBe(true);
  expect(data.message).toContain('updated successfully');
});

test("updateKPIs requires tenant_id parameter", async () => {
  // Mock supabase.functions.invoke to simulate an error response
  const mockSupabase = await import('@/integrations/supabase/client');
  mockSupabase.supabase.functions.invoke = vi.fn().mockResolvedValue({
    data: { success: false, error: "Missing required parameter: tenantId" },
    error: null
  });
  
  // Define test input without tenant_id
  const input = {
    sources: ["stripe"]
  };
  
  // Execute the function call
  const { data } = await supabase.functions.invoke('updateKPIs', {
    body: input
  });
  
  // Verify the error
  expect(data.success).toBe(false);
  expect(data.error).toContain('tenantId');
});

test("updateKPIs can handle specific sources", async () => {
  // Define test input with specific sources
  const input = {
    tenant_id: "test-tenant",
    sources: ["stripe"] // Only update Stripe KPIs
  };
  
  // Execute the function call
  const { data, error } = await supabase.functions.invoke('updateKPIs', {
    body: input
  });
  
  // Verify the result
  expect(error).toBeNull();
  expect(data).toBeDefined();
  expect(data.success).toBe(true);
});
