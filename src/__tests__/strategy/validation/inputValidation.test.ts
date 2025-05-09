
import { describe, it, expect } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { setupTests } from '../setup/testSetup';

describe('runStrategy Input Validation', () => {
  setupTests();
  
  it('should validate required fields', async () => {
    // Arrange
    const missingStrategyId = {
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    const missingTenantId = {
      strategyId: 'strategy-123',
      userId: 'user-123'
    };
    
    // Act
    const result1 = await runStrategy(missingStrategyId);
    const result2 = await runStrategy(missingTenantId);
    
    // Assert
    expect(result1.success).toBe(false);
    expect(result1.error).toBe('Strategy ID is required');
    
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('Tenant ID is required');
  });
});
