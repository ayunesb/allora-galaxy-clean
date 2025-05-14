
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '@/types/tenant';
import { fetchWorkspaces, createWorkspace as createWorkspaceService } from '@/services/workspaceService';
import { NavigationItem } from '@/types/navigation';

export interface WorkspaceContextType {
  // Primary properties (new naming convention)
  currentWorkspace: Tenant | null;
  workspaces: Tenant[];
  isLoading: boolean;
  error: Error | null;
  navigationItems: NavigationItem[];
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  refreshWorkspaces: () => Promise<void>;
  updateCurrentWorkspace: (workspaceId: string) => void;
  userRole: string | null;
  
  // Backward compatibility properties
  tenant?: Tenant | null;
  currentTenant?: Tenant | null;
  loading?: boolean;
  tenants?: Tenant[];
  setCurrentWorkspace?: (workspaceId: string) => void;
  toggleCollapsed?: () => void;
  createWorkspace: (name: string, slug?: string) => Promise<Tenant | null>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  workspaces: [],
  isLoading: true,
  refreshWorkspaces: async () => {},
  updateCurrentWorkspace: () => {},
  userRole: null,
  collapsed: false,
  setCollapsed: () => {},
  error: null,
  navigationItems: [],
  createWorkspace: async () => null
});

export const useWorkspace = () => useContext(WorkspaceContext);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Tenant | null>(null);
  const [workspaces, setWorkspaces] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);

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
    } catch (error: any) {
      console.error('Error loading workspaces:', error);
      setError(error);
      setIsLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  const updateCurrentWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspaceState(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const createWorkspace = async (name: string, slug?: string): Promise<Tenant | null> => {
    try {
      const newWorkspace = await createWorkspaceService({ name, slug });
      if (newWorkspace) {
        await refreshWorkspaces(); // Reload workspaces to include the new one
        return newWorkspace;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      setError(error);
      return null;
    }
  };

  const value: WorkspaceContextType = {
    // Primary properties
    currentWorkspace,
    workspaces,
    isLoading,
    error,
    navigationItems,
    collapsed,
    setCollapsed,
    refreshWorkspaces,
    updateCurrentWorkspace,
    userRole,
    createWorkspace,
    
    // Backward compatibility properties
    tenant: currentWorkspace,
    currentTenant: currentWorkspace,
    loading: isLoading,
    tenants: workspaces,
    setCurrentWorkspace: updateCurrentWorkspace,
    toggleCollapsed
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;
