
import { useWorkspace } from '@/contexts/WorkspaceContext';

/**
 * Hook to get the current tenant ID
 * @returns An object containing the tenant ID or null
 */
export function useTenantId(): { tenantId: string | null } {
  const { tenant } = useWorkspace();
  return { tenantId: tenant?.id || null };
}
