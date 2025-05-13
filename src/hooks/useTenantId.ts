
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface UseTenantIdResult {
  tenantId: string | undefined;
  isLoading: boolean;
}

export function useTenantId(): UseTenantIdResult {
  const { currentWorkspace, loading } = useWorkspace();
  
  return {
    tenantId: currentWorkspace?.id,
    isLoading: loading
  };
}
