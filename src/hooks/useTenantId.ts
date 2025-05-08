
import { useWorkspace } from '@/contexts/WorkspaceContext';

/**
 * Hook to easily access the current tenant ID
 * @returns The current tenant ID or null if no tenant is selected
 */
export function useTenantId(): string | null {
  const { tenant } = useWorkspace();
  return tenant?.id || null;
}
