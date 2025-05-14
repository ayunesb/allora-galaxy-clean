
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';
import { WorkspaceContextType } from './types';
import { fetchUserRole, fetchUserTenants } from './workspaceUtils';

export const useWorkspaceState = (): WorkspaceContextType => {
  const { user } = useAuth(); // Use the refactored useAuth hook
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // UI state for sidebar
  const [collapsed, setCollapsed] = useState(false);

  // Fetch workspaces when user changes
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [user]);

  // Update user role when current workspace changes
  useEffect(() => {
    if (user && currentWorkspace) {
      fetchAndSetUserRole();
    } else {
      setUserRole(null);
    }
  }, [user, currentWorkspace]);

  const fetchWorkspaces = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const tenants = await fetchUserTenants(user.id);
      setWorkspaces(tenants);
      
      // Set first workspace as current if none is selected
      if (tenants.length > 0 && !currentWorkspace) {
        const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        if (savedWorkspaceId) {
          const savedWorkspace = tenants.find(w => w.id === savedWorkspaceId);
          if (savedWorkspace) {
            setCurrentWorkspace(savedWorkspace);
          } else {
            setCurrentWorkspace(tenants[0]);
          }
        } else {
          setCurrentWorkspace(tenants[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching workspaces:', err);
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const fetchAndSetUserRole = async () => {
    if (!user || !currentWorkspace) return;

    try {
      const role = await fetchUserRole(currentWorkspace.id, user.id);
      setUserRole(role);
    } catch (err: any) {
      console.error('Error fetching user role:', err);
    }
  };

  const createWorkspace = async (name: string, slug?: string) => {
    if (!user) return;

    try {
      // Generate slug if not provided
      const workspaceSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

      // Create new tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert([
          { name, slug: workspaceSlug }
        ])
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Add user as owner
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert([
          { tenant_id: tenant.id, user_id: user.id, role: 'owner' }
        ]);

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

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      await fetchWorkspaces();
    } catch (err: any) {
      console.error('Error deleting workspace:', err);
      setError(err.message || 'Failed to delete workspace');
    }
  };

  const updateWorkspace = async (workspaceId: string, updates: { name?: string; slug?: string }) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', workspaceId)
        .select()
        .single();

      if (error) throw error;

      // If current workspace was updated, update it in state
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(data);
      }
      
      await fetchWorkspaces();
      return data;
    } catch (err: any) {
      console.error('Error updating workspace:', err);
      setError(err.message || 'Failed to update workspace');
      return undefined;
    }
  };

  const handleWorkspaceChange = (workspace: any) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
    fetchAndSetUserRole();
  };

  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return {
    currentWorkspace,
    setCurrentWorkspace: handleWorkspaceChange,
    workspaces,
    loading,
    error,
    refreshWorkspaces: fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
    updateWorkspace,
    userRole,
    isLoading: loading, // Provide both loading and isLoading for backward compatibility
    tenant: currentWorkspace,
    currentTenant: currentWorkspace,
    // UI state properties
    collapsed,
    setCollapsed,
    toggleCollapsed,
  };
};
