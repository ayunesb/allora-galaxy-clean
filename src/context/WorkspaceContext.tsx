
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '@/types/tenant';
import { fetchWorkspaces, fetchWorkspaceById, createWorkspace as createWorkspaceService } from '@/services/workspaceService';

export interface WorkspaceContextType {
  currentWorkspace: Tenant | null;
  setCurrentWorkspace: (workspaceId: string) => void;
  workspaces: Tenant[];
  isLoading: boolean;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, slug?: string) => Promise<Tenant | null>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
  workspaces: [],
  isLoading: true,
  refreshWorkspaces: async () => {},
  createWorkspace: async () => null,
});

export const useWorkspace = () => useContext(WorkspaceContext);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Tenant | null>(null);
  const [workspaces, setWorkspaces] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workspaces on mount and set the current workspace
  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const workspacesData = await fetchWorkspaces();
      setWorkspaces(workspacesData);

      // Try to set current workspace from local storage
      const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      if (storedWorkspaceId && workspacesData.some(w => w.id === storedWorkspaceId)) {
        const workspace = workspacesData.find(w => w.id === storedWorkspaceId);
        if (workspace) {
          setCurrentWorkspaceState(workspace);
        }
      } else if (workspacesData.length > 0) {
        // Default to first workspace if no stored workspace
        setCurrentWorkspaceState(workspacesData[0]);
        localStorage.setItem('currentWorkspaceId', workspacesData[0].id);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading workspaces:', error);
      setIsLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  const setCurrentWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspaceState(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
  };

  const createWorkspace = async (name: string, slug?: string): Promise<Tenant | null> => {
    try {
      const newWorkspace = await createWorkspaceService({ name, slug });
      if (newWorkspace) {
        await refreshWorkspaces(); // Reload workspaces to include the new one
        return newWorkspace;
      }
      return null;
    } catch (error) {
      console.error('Error creating workspace:', error);
      return null;
    }
  };

  const value: WorkspaceContextType = {
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    isLoading,
    refreshWorkspaces,
    createWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;
