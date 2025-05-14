
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavigationItem, Tenant } from '@/types/shared';

// Define the type for the workspace context
export interface WorkspaceContextType {
  // Current workspace state
  currentWorkspace: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  error: Error | null;
  
  // Navigation and UI state
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  
  // Tenant management
  fetchTenants: () => Promise<void>;
  switchWorkspace: (tenantId: string) => Promise<void>;
  tenant: Tenant | null; // Alias for currentWorkspace for backward compatibility
  
  // Optional methods for extended functionality
  createWorkspace?: (data: Partial<Tenant>) => Promise<Tenant>;
  updateWorkspace?: (id: string, data: Partial<Tenant>) => Promise<Tenant>;
  deleteWorkspace?: (id: string) => Promise<void>;
}

// Create the context with default values
const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  tenants: [],
  isLoading: true,
  error: null,
  
  collapsed: false,
  setCollapsed: () => {},
  mobileNavOpen: false,
  setMobileNavOpen: () => {},
  
  fetchTenants: async () => {},
  switchWorkspace: async () => {},
  tenant: null,
});

// Provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core state
  const [currentWorkspace, setCurrentWorkspace] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // UI state
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Fetch tenants on load
  useEffect(() => {
    fetchTenants();
  }, []);

  // Load workspace preference from localStorage
  useEffect(() => {
    const loadWorkspacePreference = () => {
      try {
        const savedWorkspaceId = localStorage.getItem('preferred_workspace_id');
        if (savedWorkspaceId && tenants.length > 0) {
          const savedWorkspace = tenants.find(t => t.id === savedWorkspaceId);
          if (savedWorkspace) {
            setCurrentWorkspace(savedWorkspace);
          } else {
            // If saved workspace not found, default to first
            setCurrentWorkspace(tenants[0]);
          }
        } else if (tenants.length > 0) {
          // Default to first if no preference
          setCurrentWorkspace(tenants[0]);
        }
      } catch (err) {
        console.error('Error loading workspace preference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (tenants.length > 0) {
      loadWorkspacePreference();
    }
  }, [tenants]);

  /**
   * Fetches all tenants (workspaces) the user has access to
   */
  const fetchTenants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setTenants([]);
        setCurrentWorkspace(null);
        setIsLoading(false);
        return;
      }
      
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select(`
          *,
          tenant_user_roles!inner (
            role
          )
        `)
        .eq('tenant_user_roles.user_id', sessionData.session.user.id);
      
      if (tenantsError) {
        throw tenantsError;
      }
      
      // Extract just the tenant data we need
      const userTenants: Tenant[] = tenantsData.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        created_at: item.created_at,
        updated_at: item.updated_at,
        owner_id: item.owner_id,
        settings: item.settings
      }));
      
      setTenants(userTenants);
      
      if (userTenants.length > 0) {
        // If there's already a selected workspace, try to find it in the updated list
        if (currentWorkspace) {
          const existing = userTenants.find(t => t.id === currentWorkspace.id);
          if (existing) {
            setCurrentWorkspace(existing);
          } else {
            // If not found, default to the first one
            setCurrentWorkspace(userTenants[0]);
          }
        } else {
          // No current selection, use the first one
          setCurrentWorkspace(userTenants[0]);
        }
      } else {
        // No tenants available
        setCurrentWorkspace(null);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch workspaces'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Switches the active workspace
   * @param tenantId ID of the tenant to switch to
   */
  const switchWorkspace = async (tenantId: string) => {
    if (!tenantId || isLoading) return;
    
    try {
      const tenant = tenants.find(t => t.id === tenantId);
      
      if (!tenant) {
        throw new Error(`Workspace with ID ${tenantId} not found`);
      }
      
      // Save preference to localStorage
      localStorage.setItem('preferred_workspace_id', tenantId);
      
      // Update state
      setCurrentWorkspace(tenant);
    } catch (err) {
      console.error('Error switching workspace:', err);
      setError(err instanceof Error ? err : new Error('Failed to switch workspace'));
    }
  };

  // Use an alias for backward compatibility
  const tenant = currentWorkspace;

  const contextValue: WorkspaceContextType = {
    currentWorkspace,
    tenants,
    isLoading,
    error,
    
    collapsed,
    setCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
    
    fetchTenants,
    switchWorkspace,
    tenant, // Alias for backward compatibility
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook to use the context
export const useWorkspace = () => useContext(WorkspaceContext);

// Export the provider and hook for convenience
export default WorkspaceContext;
