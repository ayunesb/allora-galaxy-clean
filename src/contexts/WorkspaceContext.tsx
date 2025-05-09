
import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkspaceState } from './workspace/useWorkspaceState';
import { WorkspaceContextType } from './workspace/types';

// Create the initial context
const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
  workspaces: [],
  loading: true,
  error: null,
  refreshWorkspaces: async () => {},
  createWorkspace: async () => undefined,
  deleteWorkspace: async () => {},
  updateWorkspace: async () => undefined,
  userRole: null,
  isLoading: true,
  tenant: null,
  currentTenant: null,
});

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  // Use our custom hook to manage workspace state
  const workspaceState = useWorkspaceState();
  
  return (
    <WorkspaceContext.Provider value={workspaceState}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
