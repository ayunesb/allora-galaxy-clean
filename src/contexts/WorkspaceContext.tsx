
import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkspaceState } from './workspace/useWorkspaceState';
import { WorkspaceContextType } from './workspace/types';

// Create the context with complete type
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
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

interface WorkspaceProviderProps {
  children: ReactNode;
  initialCollapsed?: boolean;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ 
  children, 
  initialCollapsed = false
}) => {
  // Use our custom hook to manage workspace state
  const workspaceState = useWorkspaceState();
  
  return (
    <WorkspaceContext.Provider value={workspaceState}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
