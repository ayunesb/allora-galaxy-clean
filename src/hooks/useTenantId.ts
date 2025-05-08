
import { useContext } from 'react';
import WorkspaceContext from '@/contexts/WorkspaceContext';

export function useTenantId() {
  const context = useContext(WorkspaceContext);
  
  if (!context) {
    console.warn('useTenantId must be used within a WorkspaceProvider');
    return { tenantId: null };
  }
  
  return { tenantId: context.tenant?.id || null };
}
