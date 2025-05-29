import { useWorkspace } from "@/contexts/WorkspaceContext";

export interface UseTenantIdResult {
  id: string | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useTenantId(): UseTenantIdResult {
  const { currentWorkspace, isLoading, error } = useWorkspace();

  return {
    id: currentWorkspace?.id,
    isLoading,
    error: error || null,
  };
}

export default useTenantId;
