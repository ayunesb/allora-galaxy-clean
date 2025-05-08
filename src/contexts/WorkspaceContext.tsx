
import React, { createContext, useContext, PropsWithChildren } from 'react';
import { WorkspaceContextType } from './workspace/types';
import { useWorkspaceState } from './workspace/useWorkspaceState';

// Create the context with a default value
export const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const workspaceState = useWorkspaceState();
  
  return (
    <WorkspaceContext.Provider value={workspaceState}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
};
