
// Re-export from the unified WorkspaceContext implementation
import WorkspaceContext, { WorkspaceProvider, useWorkspace, WorkspaceContextType } from '@/context/WorkspaceContext';

export { 
  WorkspaceContext,
  WorkspaceProvider,
  useWorkspace
};

export type { WorkspaceContextType };

export default WorkspaceContext;
