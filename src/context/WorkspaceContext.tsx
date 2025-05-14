
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { NavigationItem } from '@/types/shared';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  metadata?: Record<string, any>;
}

export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  workspaces: Workspace[];
  loading: boolean;
  userRole: string | null;
  navigationItems: NavigationItem[];
  refreshWorkspaces: () => Promise<void>;
  // For backward compatibility
  tenant: Workspace | null;
  tenants: Workspace[];
  setTenant: (workspace: Workspace | null) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      
      const { data: userRoles, error: rolesError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
        
      if (rolesError) throw rolesError;
      
      const tenantIds = userRoles?.map(role => role.tenant_id) || [];
      
      if (tenantIds.length === 0) {
        setWorkspaces([]);
        setLoading(false);
        return;
      }
      
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .in('id', tenantIds);
        
      if (tenantsError) throw tenantsError;
      
      setWorkspaces(tenantsData || []);
      
      // If there's a current workspace in local storage, try to load it
      const savedTenantId = localStorage.getItem('currentWorkspaceId');
      if (savedTenantId && tenantsData) {
        const savedTenant = tenantsData.find(t => t.id === savedTenantId);
        if (savedTenant) {
          setCurrentWorkspace(savedTenant);
          
          // Also fetch user role for this workspace
          const userRoleRecord = userRoles?.find(r => r.tenant_id === savedTenant.id);
          setUserRole(userRoleRecord?.role || null);
        } else if (tenantsData.length > 0) {
          // If saved tenant not found but there are tenants, use the first one
          setCurrentWorkspace(tenantsData[0]);
        }
      } else if (tenantsData && tenantsData.length > 0) {
        // No saved tenant, use the first one
        setCurrentWorkspace(tenantsData[0]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    
    // Subscribe to tenant changes
    const channel = supabase
      .channel('public:tenants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' }, () => {
        fetchWorkspaces();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // When current workspace changes, save it to local storage
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('currentWorkspaceId', currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const handleSetCurrentWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspace(workspace);
    
    if (workspace) {
      // Update user role for this workspace
      supabase
        .from('tenant_user_roles')
        .select('role')
        .eq('tenant_id', workspace.id)
        .eq('user_id', (supabase.auth.getUser()))
        .single()
        .then(({ data }) => {
          setUserRole(data?.role || null);
        });
    } else {
      setUserRole(null);
    }
  };

  // For backward compatibility
  const tenant = currentWorkspace;
  const tenants = workspaces;
  const setTenant = handleSetCurrentWorkspace;
  const isLoading = loading;

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        setCurrentWorkspace: handleSetCurrentWorkspace,
        workspaces,
        loading,
        userRole,
        navigationItems,
        refreshWorkspaces: fetchWorkspaces,
        // For backward compatibility
        tenant,
        tenants,
        setTenant,
        isLoading
      }}
    >
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

export default WorkspaceContext;
