
import { useWorkspace } from '@/contexts/WorkspaceContext';

export const useTenantId = () => {
  const { currentWorkspace } = useWorkspace();
  return currentWorkspace?.id;
};

export default useTenantId;
