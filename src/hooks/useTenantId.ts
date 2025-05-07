
import { useWorkspace } from '@/context/WorkspaceContext';

/**
 * Hook for getting the current tenant ID
 * To be used with all Supabase queries that need tenant-specific data
 */
export const useTenantId = (): string | null => {
  const { currentTenant } = useWorkspace();
  return currentTenant?.id || null;
};

/**
 * Hook that returns both the tenant ID and a boolean indicating if it's available
 * Useful for conditional rendering based on tenant availability
 */
export const useTenantAvailability = (): {
  tenantId: string | null;
  isAvailable: boolean;
} => {
  const tenantId = useTenantId();
  return {
    tenantId,
    isAvailable: !!tenantId
  };
};
