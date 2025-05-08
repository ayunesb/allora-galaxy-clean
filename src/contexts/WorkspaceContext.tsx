
import React, { createContext, useContext } from 'react';
import { useAuth } from '@/context/AuthContext';
import { WorkspaceContextType } from './workspace/types';
import { useWorkspaceState, initialWorkspaceState } from './workspace/useWorkspaceState';

// Create the workspace context
const WorkspaceContext = createContext<WorkspaceContextType>(initialWorkspaceState);

// Workspace context provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const workspaceData = useWorkspaceState(user?.id);

  return <WorkspaceContext.Provider value={workspaceData}>{children}</WorkspaceContext.Provider>;
};

// Hook to use the workspace context
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
};

export default WorkspaceContext;
