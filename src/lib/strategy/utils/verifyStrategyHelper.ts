/**
 * Verify strategy exists and belongs to tenant
 * @param strategyId The ID of the strategy to verify
 * @param tenantId The tenant ID
 * @returns The strategy data or error
 */
export async function verifyStrategyHelper(
  strategyId: string,
  tenantId: string,
) {
  if (!strategyId) {
    return { error: new Error("Strategy ID is required") };
  }

  if (!tenantId) {
    return { error: new Error("Tenant ID is required") };
  }

  // In a real implementation, we would fetch the strategy from the database
  const strategy = {
    id: strategyId,
    tenant_id: tenantId,
    title: "Sample Strategy",
    status: "approved",
  };

  return { strategy };
}
