import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Workspace, WorkspaceContextType } from './workspace/types';
import { UserRole } from '@/lib/auth/roleTypes';

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
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch workspaces
  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch tenants (workspaces) that the user has access to
      const { data: tenantRoles, error: tenantError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role, tenants(id, name, slug, metadata, created_at)')
        .eq('user_id', user.id);

      if (tenantError) {
        throw tenantError;
      }

      // Format the workspaces data
      const userWorkspaces = tenantRoles.map(tr => {
        const tenant = tr.tenants as any;
        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          metadata: tenant.metadata,
          created_at: tenant.created_at,
          role: tr.role
        };
      });

      setWorkspaces(userWorkspaces);

      // If there's no current workspace but there are available workspaces,
      // set the first one as the current workspace
      if (!currentWorkspace && userWorkspaces.length > 0) {
        setCurrentWorkspace(userWorkspaces[0]);
        // Fix: Only set userRole if role exists
        if (userWorkspaces[0].role) {
          setUserRole(userWorkspaces[0].role);
        }
        localStorage.setItem('currentWorkspace', userWorkspaces[0].id);
      } else if (currentWorkspace) {
        // Check if the current workspace still exists in the updated list
        const exists = userWorkspaces.some(w => w.id === currentWorkspace.id);
        if (!exists && userWorkspaces.length > 0) {
          setCurrentWorkspace(userWorkspaces[0]);
          // Fix: Only set userRole if role exists
          if (userWorkspaces[0].role) {
            setUserRole(userWorkspaces[0].role);
          }
          localStorage.setItem('currentWorkspace', userWorkspaces[0].id);
        } else if (exists) {
          // Update the current workspace with the latest data
          const updated = userWorkspaces.find(w => w.id === currentWorkspace.id);
          if (updated) {
            setCurrentWorkspace(updated);
            // Fix: Only set userRole if role exists
            if (updated.role) {
              setUserRole(updated.role);
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Error fetching workspaces:', err);
      setError(err.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  };

  // Create workspace
  const createWorkspace = async (name: string): Promise<Workspace | undefined> => {
    if (!user) return undefined;

    try {
      // Create a slug from the name
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Create the tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({ 
          name, 
          slug,
          owner_id: user.id 
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Add the user as the owner of the tenant
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          role: 'owner'
        });

      if (roleError) throw roleError;

      // Refresh workspaces
      await fetchWorkspaces();
      
      return tenant;
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      setError(err.message || 'Failed to create workspace');
      return undefined;
    }
  };

  // Delete workspace
  const deleteWorkspace = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh workspaces
      await fetchWorkspaces();
    } catch (err: any) {
      console.error('Error deleting workspace:', err);
      setError(err.message || 'Failed to delete workspace');
    }
  };

  // Update workspace
  const updateWorkspace = async (id: string, data: Partial<Workspace>): Promise<Workspace | undefined> => {
    try {
      const { data: updatedWorkspace, error } = await supabase
        .from('tenants')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh workspaces
      await fetchWorkspaces();
      return updatedWorkspace;
    } catch (err: any) {
      console.error('Error updating workspace:', err);
      setError(err.message || 'Failed to update workspace');
      return undefined;
    }
  };

  // Initialize workspaces on user change
  useEffect(() => {
    if (user) {
      // Load saved current workspace from localStorage
      const savedWorkspaceId = localStorage.getItem('currentWorkspace');
      
      // Fetch workspaces first
      fetchWorkspaces().then(() => {
        // After fetching, if we have a saved workspace ID and workspaces
        if (savedWorkspaceId && workspaces.length > 0) {
          const saved = workspaces.find(w => w.id === savedWorkspaceId);
          if (saved) {
            setCurrentWorkspace(saved);
            // Fix: Only set userRole if role exists and handle undefined case
            if (saved.role) {
              setUserRole(saved.role);
            }
          }
        }
      });
    } else {
      // Reset state if no user is logged in
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  // Save the selected workspace when it changes
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('currentWorkspace', currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const value = {
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    loading,
    error,
    refreshWorkspaces: fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
    updateWorkspace,
    userRole,
    isLoading: loading,
    tenant: currentWorkspace,
    currentTenant: currentWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
