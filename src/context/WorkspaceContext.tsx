
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  userWorkspaces: Workspace[];
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch user workspaces
  const fetchUserWorkspaces = async () => {
    if (!user) {
      setUserWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          tenant_id,
          role,
          tenants:tenant_id (
            id,
            name,
            slug
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const workspaces: Workspace[] = data
        .filter(item => item.tenants) // Filter out any null relationships
        .map(item => ({
          id: item.tenants.id,
          name: item.tenants.name,
          slug: item.tenants.slug,
          role: item.role
        }));

      setUserWorkspaces(workspaces);

      // Get stored workspace ID from localStorage
      const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      
      if (storedWorkspaceId && workspaces.some(w => w.id === storedWorkspaceId)) {
        const workspace = workspaces.find(w => w.id === storedWorkspaceId);
        if (workspace) {
          setCurrentWorkspace(workspace);
        }
      } else if (workspaces.length > 0) {
        // Default to first workspace
        setCurrentWorkspace(workspaces[0]);
        localStorage.setItem('currentWorkspaceId', workspaces[0].id);
      } else {
        setCurrentWorkspace(null);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setUserWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh workspaces list
  const refreshWorkspaces = async () => {
    setLoading(true);
    await fetchUserWorkspaces();
  };

  // Initialize on auth change
  useEffect(() => {
    fetchUserWorkspaces();
  }, [user]);

  return (
    <WorkspaceContext.Provider value={{ 
      currentWorkspace, 
      setCurrentWorkspace, 
      userWorkspaces, 
      loading,
      refreshWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
