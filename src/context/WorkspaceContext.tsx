
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/toast';
import { Workspace, WorkspaceContextType, WorkspaceWithRole } from '@/types/shared';

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  workspaces: [],
  currentWorkspace: null,
  isLoading: true,
  error: null,
  setCurrentWorkspace: () => {},
  switchWorkspace: async () => {},
  createWorkspace: async () => null,
  refreshWorkspaces: async () => {},
  tenant: null
});

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const fetchWorkspaces = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user) {
        throw new Error("No authenticated user found");
      }

      // Fetch tenants (workspaces) that the user has access to
      const { data: tenantRoles, error: tenantError } = await supabase
        .from('tenant_user_roles')
        .select(`
          tenant:tenants (
            id,
            name,
            slug,
            created_at,
            metadata
          ),
          role
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (tenantError) throw tenantError;

      const workspacesData = tenantRoles
        .filter(tr => tr.tenant)
        .map(tr => ({
          workspace: tr.tenant as Workspace,
          role: tr.role
        })) as WorkspaceWithRole[];

      setWorkspaces(workspacesData);

      // Set current workspace if not already set or not in the list
      if (!currentWorkspace || !workspacesData.find(w => w.workspace.id === currentWorkspace.id)) {
        const lastUsedId = localStorage.getItem('lastWorkspaceId');
        
        // Try to restore last used workspace or use first one
        if (lastUsedId && workspacesData.find(w => w.workspace.id === lastUsedId)) {
          const found = workspacesData.find(w => w.workspace.id === lastUsedId);
          setCurrentWorkspace(found ? found.workspace : null);
        } else if (workspacesData.length > 0) {
          setCurrentWorkspace(workspacesData[0].workspace);
        } else {
          setCurrentWorkspace(null);
        }
      }
    } catch (err: any) {
      console.error("Error fetching workspaces:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = async (workspaceId: string): Promise<void> => {
    try {
      const workspace = workspaces.find(w => w.workspace.id === workspaceId)?.workspace;
      if (!workspace) {
        throw new Error("Workspace not found");
      }
      
      setCurrentWorkspace(workspace);
      localStorage.setItem('lastWorkspaceId', workspaceId);
      
      // Navigate to dashboard of the new workspace
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Error switching workspace:", err);
      notify.error("Failed to switch workspace");
      throw err;
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user) {
        throw new Error("No authenticated user found");
      }

      // Create slug from name
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      // Create the workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('tenants')
        .insert({
          name,
          slug
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Create role for the user in this workspace
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: workspaceData.id,
          user_id: user.user.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      // Refresh workspaces list
      await fetchWorkspaces();
      
      // Switch to the new workspace
      if (workspaceData) {
        await switchWorkspace(workspaceData.id);
      }
      
      return workspaceData as Workspace;
    } catch (err: any) {
      console.error("Error creating workspace:", err);
      notify.error("Failed to create workspace");
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const contextValue: WorkspaceContextType = {
    workspace: currentWorkspace,
    workspaces,
    currentWorkspace,
    isLoading,
    error,
    setCurrentWorkspace,
    switchWorkspace,
    createWorkspace,
    refreshWorkspaces: fetchWorkspaces,
    tenant: currentWorkspace // Alias for backward compatibility
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

export default WorkspaceContext;
