
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Workspace } from './types';
import { toast } from '@/components/ui/use-toast';

export const useWorkspaceState = () => {
  const { user } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get all workspaces the user is a member of
      const { data: tenantUserRoles, error: rolesError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id')
        .eq('user_id', user.id);

      if (rolesError) {
        throw rolesError;
      }

      if (!tenantUserRoles || tenantUserRoles.length === 0) {
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      const tenantIds = tenantUserRoles.map(role => role.tenant_id);
      
      // Fetch workspace details
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .in('id', tenantIds);
        
      if (tenantsError) {
        throw tenantsError;
      }

      setWorkspaces(tenantsData || []);
      
      // Set current workspace from localStorage or use first available
      const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      if (storedWorkspaceId && tenantsData) {
        const storedWorkspace = tenantsData.find(t => t.id === storedWorkspaceId);
        if (storedWorkspace) {
          setCurrentWorkspace(storedWorkspace);
        } else if (tenantsData.length > 0) {
          setCurrentWorkspace(tenantsData[0]);
          localStorage.setItem('currentWorkspaceId', tenantsData[0].id);
        }
      } else if (tenantsData && tenantsData.length > 0) {
        setCurrentWorkspace(tenantsData[0]);
        localStorage.setItem('currentWorkspaceId', tenantsData[0].id);
      }
    } catch (err: any) {
      console.error('Error loading workspaces:', err);
      setError(err.message || 'Failed to load workspaces');
      toast({
        title: "Error",
        description: "Failed to load workspaces. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  // Create a new workspace
  const createWorkspace = async (name: string): Promise<Workspace | undefined> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a workspace",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a slug from the name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
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
        
      if (tenantError) {
        throw tenantError;
      }

      // Add the user as an owner
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          role: 'owner'
        });
        
      if (roleError) {
        throw roleError;
      }

      // Refresh workspaces
      await refreshWorkspaces();
      
      // Set this as current workspace
      if (tenant) {
        setCurrentWorkspace(tenant);
        localStorage.setItem('currentWorkspaceId', tenant.id);
      }
      
      toast({
        title: "Success",
        description: `Workspace "${name}" created successfully`,
      });
      
      return tenant;
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create workspace",
        variant: "destructive",
      });
    }
  };

  // Delete a workspace
  const deleteWorkspace = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Refresh the list and update current workspace if needed
      await refreshWorkspaces();
      
      if (currentWorkspace?.id === id) {
        // If the deleted workspace was the current one, set a new current workspace
        if (workspaces.length > 0) {
          const newCurrentWorkspace = workspaces.find(w => w.id !== id);
          if (newCurrentWorkspace) {
            setCurrentWorkspace(newCurrentWorkspace);
            localStorage.setItem('currentWorkspaceId', newCurrentWorkspace.id);
          } else {
            setCurrentWorkspace(null);
            localStorage.removeItem('currentWorkspaceId');
          }
        } else {
          setCurrentWorkspace(null);
          localStorage.removeItem('currentWorkspaceId');
        }
      }
      
      toast({
        title: "Success",
        description: "Workspace deleted successfully",
      });
    } catch (err: any) {
      console.error('Error deleting workspace:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete workspace",
        variant: "destructive",
      });
    }
  };

  // Update a workspace
  const updateWorkspace = async (id: string, data: Partial<Workspace>): Promise<Workspace | undefined> => {
    try {
      const { data: updatedWorkspace, error } = await supabase
        .from('tenants')
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Refresh workspaces
      await refreshWorkspaces();
      
      // Update current workspace if this was the one updated
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(updatedWorkspace);
      }
      
      toast({
        title: "Success",
        description: "Workspace updated successfully",
      });
      
      return updatedWorkspace;
    } catch (err: any) {
      console.error('Error updating workspace:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update workspace",
        variant: "destructive",
      });
    }
  };

  // Load workspaces when user changes
  useEffect(() => {
    loadWorkspaces();
  }, [user]);

  return {
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    loading,
    error,
    refreshWorkspaces,
    createWorkspace,
    deleteWorkspace,
    updateWorkspace
  };
};
