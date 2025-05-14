
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '@/types/tenant';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export interface WorkspaceContextType {
  currentWorkspace: Tenant | null;
  workspaces: Tenant[];
  isLoading: boolean;
  error: Error | null;
  setCurrentWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  workspaces: [],
  isLoading: true,
  error: null,
  setCurrentWorkspace: () => {},
  refreshWorkspaces: async () => {}
});

export const WorkspaceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Tenant | null>(null);
  const [workspaces, setWorkspaces] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchWorkspaces = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch tenants the user has access to
      const { data: tenantRoles, error: tenantRolesError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role')
        .eq('user_id', user.id);

      if (tenantRolesError) throw new Error(tenantRolesError.message);

      if (!tenantRoles.length) {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setIsLoading(false);
        return;
      }

      const tenantIds = tenantRoles.map(tr => tr.tenant_id);

      // Fetch tenant details
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .in('id', tenantIds);

      if (tenantsError) throw new Error(tenantsError.message);

      setWorkspaces(tenants);

      // Set current workspace if not already set
      if (tenants.length > 0) {
        const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        
        if (storedWorkspaceId) {
          const workspace = tenants.find(t => t.id === storedWorkspaceId);
          if (workspace) {
            setCurrentWorkspace(workspace);
          } else {
            setCurrentWorkspace(tenants[0]);
            localStorage.setItem('currentWorkspaceId', tenants[0].id);
          }
        } else {
          setCurrentWorkspace(tenants[0]);
          localStorage.setItem('currentWorkspaceId', tenants[0].id);
        }
      } else {
        setCurrentWorkspace(null);
      }
    } catch (err: any) {
      console.error('Error fetching workspaces:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchWorkspaces();
    }
  }, [authLoading, isAuthenticated]);

  const updateCurrentWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        isLoading,
        error,
        setCurrentWorkspace: updateCurrentWorkspace,
        refreshWorkspaces: fetchWorkspaces
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
