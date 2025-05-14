
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Compass, Home, LayoutDashboard, Package, PlugZap, Settings, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { NavigationItem, UserRole } from '@/types/shared';

// Define interfaces for the workspace context
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  metadata: Record<string, any> | null;
}

export interface UserWorkspaceRole {
  role: UserRole;
  workspace: Workspace;
}

export interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: UserWorkspaceRole[];
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  navigation: NavigationItem[];
}

// Create the context
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<UserWorkspaceRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Define navigation items
  const navigation: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Galaxy',
      href: '/galaxy',
      icon: Compass
    },
    {
      title: 'Strategies',
      href: '/strategies',
      icon: Home
    },
    {
      title: 'Agents',
      href: '/agents',
      icon: UserCircle
    },
    {
      title: 'Plugins',
      href: '/plugins',
      icon: PlugZap
    },
    {
      title: 'Packages',
      href: '/packages',
      icon: Package,
      isNew: true,
    },
    {
      title: 'Admin',
      href: '/admin',
      icon: Settings,
      adminOnly: true,
    },
  ];

  // Function to fetch workspaces
  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch all workspaces the user has access to along with their roles
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          role,
          tenant:tenants(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Map the data to the expected format
      const userWorkspaces: UserWorkspaceRole[] = data.map(item => ({
        role: item.role as UserRole,
        workspace: {
          id: item.tenant.id,
          name: item.tenant.name,
          slug: item.tenant.slug,
          owner_id: item.tenant.owner_id,
          metadata: item.tenant.metadata
        }
      }));

      setWorkspaces(userWorkspaces);

      // If we don't have a current workspace but have workspaces available, set the first one
      if (!workspace && userWorkspaces.length > 0) {
        setWorkspace(userWorkspaces[0].workspace);
        setIsAdmin(['admin', 'owner'].includes(userWorkspaces[0].role));
      }

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch workspaces');
      console.error('Error fetching workspaces:', error);
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set the current workspace
  const setCurrentWorkspace = (newWorkspace: Workspace) => {
    setWorkspace(newWorkspace);
    
    // Update the isAdmin flag based on the role for the new workspace
    const workspaceRole = workspaces.find(w => w.workspace.id === newWorkspace.id);
    setIsAdmin(['admin', 'owner'].includes(workspaceRole?.role || 'member'));
  };

  // Refresh workspaces function exposed in the context
  const refreshWorkspaces = async () => {
    return await fetchWorkspaces();
  };

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Context value
  const contextValue: WorkspaceContextType = {
    workspace,
    workspaces,
    isAdmin,
    isLoading,
    error,
    setCurrentWorkspace,
    refreshWorkspaces,
    navigation
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook to use the workspace context
export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;
