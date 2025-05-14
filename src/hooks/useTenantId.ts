
import { useContext } from 'react';
import { WorkspaceContext } from '@/contexts/workspace/WorkspaceContext';

export interface UseTenantIdResult {
  id: string | null;
}

export const useTenantId = (): UseTenantIdResult => {
  const { currentTenantId } = useContext(WorkspaceContext);
  
  return {
    id: currentTenantId
  };
};

export default useTenantId;
