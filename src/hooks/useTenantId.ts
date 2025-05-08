
import { useContext } from 'react';
import { WorkspaceContext } from '@/context/WorkspaceContext';

export function useTenantId() {
  const context = useContext(WorkspaceContext);
  
  if (!context) {
    console.warn('useTenantId must be used within a WorkspaceProvider');
    return { tenantId: null, loading: false };
  }
  
  return { 
    tenantId: context.currentTenant?.id || null,
    loading: context.loading 
  };
}
