
import { describe, it, expect } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { setupTests } from '../setup/testSetup';
import { invalidInputs } from '../mocks/strategyMocks';

describe('runStrategy Input Validation', () => {
  setupTests();
  
  it('should validate required fields', async () => {
    // Test missing strategy ID
    const result1 = await runStrategy(invalidInputs.missingStrategyId);
    expect(result1.success).toBe(false);
    expect(result1.error).toBe('Strategy ID is required');
    
    // Test missing tenant ID
    const result2 = await runStrategy(invalidInputs.missingTenantId);
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('Tenant ID is required');
  });
});
