
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Tenant } from '@/types/tenant';
import { NavigationItem } from '@/types/shared';
import { navigationItems } from '@/contexts/workspace/navigationItems';

/**
 * WorkspaceContextType defines the shape of the Workspace context.
 * This context manages workspace/tenant data, navigation state, and user roles.
 * 
 * @property currentWorkspace - The currently selected workspace/tenant
 * @property workspaces - Array of all workspaces/tenants accessible to the user
 * @property isLoading - Whether workspace data is currently being loaded
 * @property error - Any error that occurred during loading
 * @property navigationItems - Navigation items for the sidebar
 * @property collapsed - Whether the sidebar is collapsed
 * @property userRole - The user's role in the current workspace
 * @property setCollapsed - Function to set the sidebar collapsed state
 * @property refreshWorkspaces - Function to refresh the list of workspaces
 * @property setCurrentWorkspace - Function to change the current workspace
 * @property updateCurrentWorkspace - Alias for setCurrentWorkspace (for backward compatibility)
 * @property toggleCollapsed - Function to toggle the sidebar collapsed state
 * @property tenant - Alias for currentWorkspace (for backward compatibility)
 * @property currentTenant - Alias for currentWorkspace (for backward compatibility)
 * @property loading - Alias for isLoading (for backward compatibility)
 * @property tenants - Alias for workspaces (for backward compatibility)
 */
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

// Create the context with a default value of undefined
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * WorkspaceProvider component that wraps the application to provide workspace context.
 * It handles fetching workspace data, managing workspace selection, and sidebar state.
 */
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
  
  /**
   * Refresh the list of workspaces for the current user
   * This is useful after changes like creating a new workspace or accepting an invitation
   */
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
  
  /**
   * Change the current workspace
   * @param workspaceId ID of the workspace to set as current
   */
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
  
  /**
   * Toggle sidebar collapsed state
   */
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

/**
 * Custom hook for accessing the workspace context
 * @throws Error if used outside of a WorkspaceProvider
 * @returns The workspace context
 */
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;
