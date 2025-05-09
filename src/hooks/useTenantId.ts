
import { useWorkspace } from '@/contexts/WorkspaceContext';

/**
 * Hook to get the current tenant ID from the workspace context
 * @returns The current tenant ID or undefined if not available
 */
export function useTenantId(): string | undefined {
  const { currentWorkspace } = useWorkspace();
  return currentWorkspace?.id;
}

export default useTenantId;
