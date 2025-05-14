
import { useWorkspace } from "@/context/WorkspaceContext";

interface UseTenantIdResult {
  tenantId: string | undefined;
  isLoading: boolean;
}

export function useTenantId(): UseTenantIdResult {
  const { currentTenant, loading } = useWorkspace();
  
  return {
    tenantId: currentTenant?.id,
    isLoading: loading
  };
}
