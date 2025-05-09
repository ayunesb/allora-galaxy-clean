
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceContextType, Workspace } from './workspace/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

const defaultWorkspaceContext: WorkspaceContextType = {
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
  currentTenant: null
};

export const WorkspaceContext = createContext<WorkspaceContextType>(defaultWorkspaceContext);

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user's workspaces
      const { data, error: fetchError } = await supabase
        .from('tenant_user_roles')
        .select(`
          role,
          tenant:tenants (
            id,
            name,
            slug,
            metadata,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        throw fetchError;
      }

      // Transform and set workspaces
      const userWorkspaces = data
        .filter(item => item.tenant)
        .map(item => ({
          ...item.tenant,
          role: item.role
        }));

      setWorkspaces(userWorkspaces);

      // Set current workspace from local storage or first available
      const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      const workspaceToSet = 
        userWorkspaces.find(w => w.id === storedWorkspaceId) || 
        userWorkspaces[0] || 
        null;

      if (workspaceToSet) {
        setCurrentWorkspace(workspaceToSet);
        localStorage.setItem('currentWorkspaceId', workspaceToSet.id);
        
        // Set user role for the current workspace
        const workspaceData = data.find(item => item.tenant?.id === workspaceToSet.id);
        if (workspaceData) {
          setUserRole(workspaceData.role);
        }
      }

    } catch (err: any) {
      console.error('Error fetching workspaces:', err);
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshWorkspaces = useCallback(async () => {
    await fetchWorkspaces();
  }, [fetchWorkspaces]);

  const createWorkspace = async (name: string): Promise<Workspace | undefined> => {
    if (!user) return undefined;
    
    try {
      setError(null);
      
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Create new workspace
      const { data, error: createError } = await supabase
        .from('tenants')
        .insert({
          name,
          slug,
          owner_id: user.id
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Add user as owner to the workspace
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: data.id,
          user_id: user.id,
          role: 'owner'
        });
      
      if (roleError) throw roleError;
      
      // Refresh workspaces list
      await refreshWorkspaces();
      
      toast({
        title: "Workspace created",
        description: `${name} has been created successfully.`,
      });
      
      return data;
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      setError(err.message || 'Failed to create workspace');
      
      toast({
        title: "Error creating workspace",
        description: err.message || 'An error occurred while creating the workspace.',
        variant: "destructive"
      });
      
      return undefined;
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>): Promise<Workspace | undefined> => {
    try {
      setError(null);
      
      const { data: updatedWorkspace, error: updateError } = await supabase
        .from('tenants')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Refresh the workspace list
      await refreshWorkspaces();
      
      toast({
        title: "Workspace updated",
        description: `Workspace settings have been updated.`,
      });
      
      return updatedWorkspace;
    } catch (err: any) {
      console.error('Error updating workspace:', err);
      setError(err.message || 'Failed to update workspace');
      
      toast({
        title: "Error updating workspace",
        description: err.message || 'An error occurred while updating the workspace.',
        variant: "destructive"
      });
      
      return undefined;
    }
  };

  const deleteWorkspace = async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Ensure we are not deleting the current workspace
      if (currentWorkspace?.id === id) {
        throw new Error("Cannot delete the currently active workspace.");
      }
      
      // Delete the workspace
      const { error: deleteError } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Refresh workspaces list
      await refreshWorkspaces();
      
      toast({
        title: "Workspace deleted",
        description: `The workspace has been removed.`,
      });
    } catch (err: any) {
      console.error('Error deleting workspace:', err);
      setError(err.message || 'Failed to delete workspace');
      
      toast({
        title: "Error deleting workspace",
        description: err.message || 'An error occurred while deleting the workspace.',
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Set current workspace when changing
  const handleSetCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
    
    // Update user role for the selected workspace
    const workspaceData = workspaces.find(w => w.id === workspace.id);
    if (workspaceData && 'role' in workspaceData) {
      setUserRole(workspaceData.role as string);
    }
  };

  const value: WorkspaceContextType = {
    currentWorkspace,
    setCurrentWorkspace: handleSetCurrentWorkspace,
    workspaces,
    loading,
    error,
    refreshWorkspaces,
    createWorkspace,
    deleteWorkspace,
    updateWorkspace,
    userRole,
    isLoading: loading,
    tenant: currentWorkspace,
    currentTenant: currentWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
