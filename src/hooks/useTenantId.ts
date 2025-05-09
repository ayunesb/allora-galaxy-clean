
import { useWorkspace } from '@/context/WorkspaceContext';

/**
 * Hook to easily access the current tenant ID
 * @returns The current tenant ID or null if no tenant is selected
 */
export function useTenantId(): string | null {
  const { currentWorkspace } = useWorkspace();
  return currentWorkspace?.id || null;
}

export default useTenantId;
