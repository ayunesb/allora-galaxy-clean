
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Tenant } from '@/types/tenant';
import { useAuth } from '@/context/AuthContext';
import { useTenantRole } from '@/hooks/useTenantRole';
import { getDefaultWorkspaceNavigation, getWorkspaceNavigation } from '@/contexts/workspace/navigationItems';
import { NavigationItem } from '@/types/navigation';

interface WorkspaceContextType {
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
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  workspaces: [],
  isLoading: true,
  error: null,
  navigationItems: [],
  collapsed: false,
  setCollapsed: () => {},
  refreshWorkspaces: async () => {},
  updateCurrentWorkspace: () => {},
  userRole: null
});

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Tenant[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  
  // Find the current workspace object
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || null;
  
  // Get the user's role in the current workspace
  const { role: userRole } = useTenantRole(currentWorkspaceId);
  
  // Generate navigation items based on the current workspace and user role
  const navigationItems = currentWorkspace
    ? getWorkspaceNavigation(currentWorkspace, userRole)
    : getDefaultWorkspaceNavigation();
  
  // Load workspaces when user changes
  useEffect(() => {
    if (user) {
      refreshWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      setIsLoading(false);
    }
  }, [user]);
  
  // Handle local storage for current workspace selection
  useEffect(() => {
    if (currentWorkspaceId) {
      localStorage.setItem('currentWorkspaceId', currentWorkspaceId);
    }
  }, [currentWorkspaceId]);
  
  // Function to refresh workspaces
  const refreshWorkspaces = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch tenant_user_roles where the user is a member
      const { data: userRoles, error: rolesError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role')
        .eq('user_id', user.id);
        
      if (rolesError) throw rolesError;
      
      if (!userRoles || userRoles.length === 0) {
        setWorkspaces([]);
        setCurrentWorkspaceId(null);
        setIsLoading(false);
        return;
      }
      
      // Get the tenant IDs
      const tenantIds = userRoles.map(role => role.tenant_id);
      
      // Fetch the actual tenant data
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .in('id', tenantIds);
        
      if (tenantError) throw tenantError;
      
      if (tenantData && tenantData.length > 0) {
        setWorkspaces(tenantData);
        
        // Set current workspace from local storage or use the first one
        const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        const exists = tenantData.some(w => w.id === storedWorkspaceId);
        setCurrentWorkspaceId(
          exists ? storedWorkspaceId : tenantData[0].id
        );
      } else {
        setWorkspaces([]);
        setCurrentWorkspaceId(null);
      }
    } catch (err: any) {
      console.error('Error fetching workspaces:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to update the current workspace
  const updateCurrentWorkspace = (workspaceId: string) => {
    const exists = workspaces.some(w => w.id === workspaceId);
    if (exists) {
      setCurrentWorkspaceId(workspaceId);
    }
  };
  
  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        isLoading,
        error,
        navigationItems,
        collapsed,
        setCollapsed,
        refreshWorkspaces,
        updateCurrentWorkspace,
        userRole
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);

export default WorkspaceContext;
