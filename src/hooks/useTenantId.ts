
import { useContext } from 'react';
import { WorkspaceContextType } from '@/contexts/WorkspaceContext';
import WorkspaceContext from '@/contexts/WorkspaceContext';

/**
 * Hook to get the current tenant ID
 * @returns An object containing the tenant ID or null
 */
export function useTenantId(): { tenantId: string | null } {
  const context = useContext<WorkspaceContextType>(WorkspaceContext);
  
  if (!context) {
    console.warn('useTenantId must be used within a WorkspaceProvider');
    return { tenantId: null };
  }
  
  return { tenantId: context.tenant?.id || null };
}
