
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@/lib/supabase';
import { defaultWorkspaceNavigation, getWorkspaceNavigation } from '@/contexts/workspace/navigationItems';
import type { Tenant } from '@/types/tenant';
import type { NavigationItem } from '@/types/navigation';
import { toast } from '@/hooks/use-toast';

// Define the structure of our workspace context
export interface WorkspaceContextType {
  currentWorkspace: Tenant | null;
  workspaces: Tenant[];
  navigationItems: NavigationItem[];
  isLoading: boolean;
  tenant: Tenant | null;
  currentTenant: Tenant | null;
  userRole: string | null;
  setCurrentWorkspace: (workspace: Tenant | null) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace?: (name: string, description?: string) => Promise<Tenant | null>;
}

// Create the context with default values
const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  workspaces: [],
  navigationItems: defaultWorkspaceNavigation,
  isLoading: true,
  tenant: null,
  currentTenant: null,
  userRole: null,
  setCurrentWorkspace: () => {},
  refreshWorkspaces: async () => {}
});

// Provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Tenant | null>(null);
  const [workspaces, setWorkspaces] = useState<Tenant[]>([]);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(defaultWorkspaceNavigation);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Helper function to fetch workspaces
  const fetchWorkspaces = async (userId?: string) => {
    if (!userId) return;
    
    try {
      // First get tenants the user has access to
      const { data: tenantRoles, error: tenantRolesError } = await supabase
        .from('tenant_user_roles')
        .select(`
          role,
          tenant_id,
          tenants:tenant_id (
            id,
            name,
            slug,
            owner_id,
            created_at,
            updated_at,
            metadata
          )
        `)
        .eq('user_id', userId);

      if (tenantRolesError) throw tenantRolesError;
      
      // Extract tenants and set user role for current workspace
      if (tenantRoles && tenantRoles.length > 0) {
        const extractedTenants = tenantRoles
          .map(tr => tr.tenants as unknown as Tenant)
          .filter(Boolean);
        
        setWorkspaces(extractedTenants);
        
        // Try to restore last selected workspace from localStorage
        const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        if (savedWorkspaceId) {
          const savedWorkspace = extractedTenants.find(ws => ws.id === savedWorkspaceId);
          if (savedWorkspace) {
            setCurrentWorkspace(savedWorkspace);
            
            // Set user role for this workspace
            const workspaceRole = tenantRoles.find(tr => tr.tenant_id === savedWorkspaceId)?.role;
            setUserRole(workspaceRole || null);
            
            // Update navigation based on role and workspace
            setNavigationItems(getWorkspaceNavigation(workspaceRole || 'member'));
            return;
          }
        }
        
        // If no saved workspace or it wasn't found, use the first one
        if (extractedTenants.length > 0) {
          setCurrentWorkspace(extractedTenants[0]);
          
          // Set user role for this workspace
          const workspaceRole = tenantRoles.find(tr => tr.tenant_id === extractedTenants[0].id)?.role;
          setUserRole(workspaceRole || null);
          
          // Update navigation based on role
          setNavigationItems(getWorkspaceNavigation(workspaceRole || 'member'));
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: 'Error fetching workspaces',
        description: 'Please try again or contact support if the problem persists.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup auth listener when component mounts
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          fetchWorkspaces(session.user.id);
        } else {
          setWorkspaces([]);
          setCurrentWorkspace(null);
          setIsLoading(false);
        }
      }
    );

    // Initial fetch of session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchWorkspaces(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle workspace change
  const handleSetCurrentWorkspace = (workspace: Tenant | null) => {
    setCurrentWorkspace(workspace);
    
    if (workspace) {
      localStorage.setItem('currentWorkspaceId', workspace.id);
      
      // Update user role for the new workspace
      if (session?.user.id) {
        supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', workspace.id)
          .eq('user_id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setUserRole(data.role);
              setNavigationItems(getWorkspaceNavigation(data.role));
            }
          });
      }
    } else {
      localStorage.removeItem('currentWorkspaceId');
      setUserRole(null);
      setNavigationItems(defaultWorkspaceNavigation);
    }
  };

  // Function to refresh workspace list
  const refreshWorkspaces = async () => {
    setIsLoading(true);
    if (session?.user) {
      await fetchWorkspaces(session.user.id);
    } else {
      setIsLoading(false);
    }
  };

  // Create a new workspace
  const createWorkspace = async (name: string, description?: string): Promise<Tenant | null> => {
    if (!session?.user) return null;
    
    try {
      // Generate a slug from the name
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      // Create the tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert([
          { 
            name, 
            slug,
            owner_id: session.user.id,
            metadata: { description }
          }
        ])
        .select()
        .single();
        
      if (tenantError) throw tenantError;
      
      // Add the user as owner
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert([
          {
            tenant_id: tenant.id,
            user_id: session.user.id,
            role: 'owner'
          }
        ]);
        
      if (roleError) throw roleError;
      
      // Refresh workspaces and select the new one
      await refreshWorkspaces();
      handleSetCurrentWorkspace(tenant);
      
      return tenant;
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error creating workspace',
        description: 'Please try again or contact support if the problem persists.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        navigationItems,
        isLoading,
        tenant: currentWorkspace, // For backward compatibility
        currentTenant: currentWorkspace, // For backward compatibility
        userRole,
        setCurrentWorkspace: handleSetCurrentWorkspace,
        refreshWorkspaces,
        createWorkspace
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook for using the workspace context
export const useWorkspace = () => useContext(WorkspaceContext);

export default WorkspaceContext;
