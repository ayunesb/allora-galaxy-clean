
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Tenant } from '@/types/tenant';
import { NavigationItem } from '@/types/shared';
import { navigationItems } from './workspace/navigationItems';

// Define the type for the context
export interface WorkspaceContextType {
  // Primary properties 
  currentWorkspace: Tenant | null;
  workspaces: Tenant[];
  isLoading: boolean;
  error: Error | null;
  navigationItems: NavigationItem[];
  collapsed: boolean;
  userRole: string | null;
  
  // Methods
  setCollapsed: (collapsed: boolean) => void;
  refreshWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (workspaceId: string) => void;
  updateCurrentWorkspace: (workspaceId: string) => void;
  toggleCollapsed: () => void;
  
  // Backward compatibility properties
  tenant?: Tenant | null; // Alias for currentWorkspace
  currentTenant?: Tenant | null; // Alias for currentWorkspace
  loading?: boolean; // Alias for isLoading
  tenants?: Tenant[]; // Alias for workspaces
}

// Create the context with a default value
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Tenant | null>(null);
  const [workspaces, setWorkspaces] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch the workspaces on component mount
  useEffect(() => {
    const fetchWorkspacesForUser = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setWorkspaces([]);
          setCurrentWorkspaceState(null);
          return;
        }
        
        // Fetch the user's workspaces (tenants)
        const { data: userTenants, error: tenantsError } = await supabase
          .from('tenant_user_roles')
          .select('tenant_id, role, tenants:tenant_id(id, name, slug, metadata)')
          .eq('user_id', user.id);
          
        if (tenantsError) {
          throw new Error(`Error fetching tenants: ${tenantsError.message}`);
        }
        
        // Transform the data
        const tenants = userTenants
          .filter(ut => ut.tenants) // Filter out any null tenants
          .map(ut => ({
            ...ut.tenants,
            role: ut.role
          }));
          
        setWorkspaces(tenants);
        
        // Set the first workspace as current if none is selected
        if (tenants.length > 0 && !currentWorkspace) {
          setCurrentWorkspaceState(tenants[0]);
          setUserRole(tenants[0].role);
          
          // Store in local storage
          localStorage.setItem('currentWorkspaceId', tenants[0].id);
        } else if (currentWorkspace) {
          // Find the current workspace in the updated list
          const updatedCurrentWorkspace = tenants.find(t => t.id === currentWorkspace.id);
          if (updatedCurrentWorkspace) {
            setCurrentWorkspaceState(updatedCurrentWorkspace);
            setUserRole(updatedCurrentWorkspace.role);
          } else if (tenants.length > 0) {
            // If current workspace no longer exists, set to the first one
            setCurrentWorkspaceState(tenants[0]);
            setUserRole(tenants[0].role);
            localStorage.setItem('currentWorkspaceId', tenants[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch workspaces'));
      } finally {
        setIsLoading(false);
      }
    };
    
    // Try to restore from localStorage
    const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
    if (savedWorkspaceId && !currentWorkspace) {
      // We'll load this specific workspace when fetching all workspaces
      console.log('Found saved workspace ID:', savedWorkspaceId);
    }
    
    fetchWorkspacesForUser();
    
    // Set up subscription to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchWorkspacesForUser();
    });
    
    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // Method to refresh workspaces
  const refreshWorkspaces = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setWorkspaces([]);
        setCurrentWorkspaceState(null);
        return;
      }
      
      const { data: userTenants, error: tenantsError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role, tenants:tenant_id(id, name, slug, metadata)')
        .eq('user_id', user.id);
        
      if (tenantsError) {
        throw new Error(`Error fetching tenants: ${tenantsError.message}`);
      }
      
      const tenants = userTenants
        .filter(ut => ut.tenants)
        .map(ut => ({
          ...ut.tenants,
          role: ut.role
        }));
        
      setWorkspaces(tenants);
      
      // Update current workspace if needed
      if (currentWorkspace) {
        const updatedCurrentWorkspace = tenants.find(t => t.id === currentWorkspace.id);
        if (updatedCurrentWorkspace) {
          setCurrentWorkspaceState(updatedCurrentWorkspace);
          setUserRole(updatedCurrentWorkspace.role);
        } else if (tenants.length > 0) {
          setCurrentWorkspaceState(tenants[0]);
          setUserRole(tenants[0].role);
          localStorage.setItem('currentWorkspaceId', tenants[0].id);
        }
      }
    } catch (err) {
      console.error('Error refreshing workspaces:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh workspaces'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Method to change the current workspace
  const setCurrentWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspaceState(workspace);
      setUserRole(workspace.role);
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
  };
  
  // For backward compatibility
  const updateCurrentWorkspace = setCurrentWorkspace;
  
  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  // Create the context value object with memoization for performance
  const contextValue = useMemo<WorkspaceContextType>(() => ({
    // Primary properties
    currentWorkspace,
    workspaces,
    isLoading,
    error,
    navigationItems,
    collapsed,
    userRole,
    
    // Methods
    setCollapsed,
    refreshWorkspaces,
    setCurrentWorkspace,
    updateCurrentWorkspace,
    toggleCollapsed,
    
    // Backward compatibility properties
    tenant: currentWorkspace,
    currentTenant: currentWorkspace,
    loading: isLoading,
    tenants: workspaces,
  }), [
    currentWorkspace,
    workspaces,
    isLoading,
    error,
    collapsed,
    userRole
  ]);
  
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook for using the context
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;
