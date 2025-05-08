
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NavigationItem, WorkspaceContextType, Tenant } from './workspace/types';
import { navigationItems } from './workspace/navigationItems';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/auth/roleTypes';

// Create the workspace context
const WorkspaceContext = createContext<WorkspaceContextType>({
  navigationItems: navigationItems,
  currentTenant: null,
  tenants: [],
  currentUrl: '',
  isLoading: true,
  setCurrentUrl: () => {},
  switchTenant: async () => false,
});

// Define initial workspace data
const initialWorkspaceState: WorkspaceContextType = {
  navigationItems: navigationItems,
  currentTenant: null,
  tenants: [],
  currentUrl: '',
  isLoading: true,
  currentRole: undefined,
  loading: true,
  tenant: null,
  setCurrentUrl: () => {},
  switchTenant: async () => false,
};

// Workspace context provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaceData, setWorkspaceData] = useState<WorkspaceContextType>(initialWorkspaceState);

  // Custom navigation items based on user role
  const getNavigationItems = (role?: string): NavigationItem[] => {
    // Base navigation items for all users
    const navItems: NavigationItem[] = [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { id: 'galaxy', label: 'Galaxy', path: '/galaxy', icon: 'Globe' },
      { id: 'launch', label: 'Launch', path: '/launch', icon: 'Rocket' },
      { id: 'agents', label: 'Agents', path: '/agents/performance', icon: 'Bot' },
      { id: 'insights', label: 'Insights', path: '/insights/kpis', icon: 'LineChart' },
    ];

    // Add admin section for admin users
    if (role === 'admin' || role === 'owner') {
      navItems.push({
        id: 'admin',
        label: 'Admin',
        path: '/admin/users',
        icon: 'ShieldCheck',
        children: [
          { id: 'users', label: 'Users', path: '/admin/users' },
          { id: 'plugin-logs', label: 'Plugin Logs', path: '/admin/plugin-logs' },
          { id: 'ai-decisions', label: 'AI Decisions', path: '/admin/ai-decisions' },
          { id: 'system-logs', label: 'System Logs', path: '/admin/system-logs' },
        ],
      });
    }

    return navItems;
  };

  // Fetch tenant data
  const fetchTenant = async (tenantId: string) => {
    try {
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*, tenant_user_roles!inner(role)')
        .eq('id', tenantId)
        .eq('tenant_user_roles.user_id', user?.id)
        .single();

      if (tenantError) {
        console.error('Error fetching workspace tenant:', tenantError);
        return null;
      }

      if (!tenantData) {
        return null;
      }

      return {
        ...tenantData,
        role: tenantData.tenant_user_roles[0].role,
      };
    } catch (error) {
      console.error('Error fetching workspace tenant:', error);
      return null;
    }
  };

  // Fetch all tenants for the current user
  const fetchTenants = async () => {
    try {
      // First, get tenant-user associations
      const { data: tenantRoles, error: tenantRolesError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role')
        .eq('user_id', user?.id);

      if (tenantRolesError) {
        console.error('Error fetching user tenants:', tenantRolesError);
        return [];
      }

      if (!tenantRoles || tenantRoles.length === 0) {
        return [];
      }

      // Then get the actual tenant details
      const tenantIds = tenantRoles.map(tr => tr.tenant_id);
      
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .in('id', tenantIds);

      if (tenantsError) {
        console.error('Error fetching tenant details:', tenantsError);
        return [];
      }

      // Combine tenant details with roles
      return tenantsData.map(tenant => {
        const tenantRole = tenantRoles.find(tr => tr.tenant_id === tenant.id);
        return {
          ...tenant,
          role: tenantRole?.role as UserRole
        };
      });
    } catch (error) {
      console.error('Error fetching user tenants:', error);
      return [];
    }
  };

  // Switch to a different tenant
  const switchTenant = async (tenantId: string): Promise<boolean> => {
    try {
      setWorkspaceData((prev) => ({ ...prev, isLoading: true }));
      
      const tenant = await fetchTenant(tenantId);
      
      if (!tenant) {
        toast({
          title: 'Error',
          description: 'Failed to switch workspace. Tenant not found or access denied.',
          variant: 'destructive',
        });
        return false;
      }

      // Update local storage with the current tenant ID
      localStorage.setItem('currentTenantId', tenantId);
      
      // Update context with new tenant and navigation items
      setWorkspaceData((prev) => ({
        ...prev,
        currentTenant: tenant,
        tenant: tenant, // For backward compatibility
        currentRole: tenant.role, // For backward compatibility
        loading: false, // For backward compatibility
        userRole: tenant.role, // For backward compatibility
        navigationItems: getNavigationItems(tenant.role),
        isLoading: false,
      }));
      
      return true;
    } catch (error) {
      console.error('Error switching tenant:', error);
      setWorkspaceData((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // Load workspace data when user changes
  useEffect(() => {
    const loadWorkspaceData = async () => {
      if (!user) {
        setWorkspaceData({
          ...initialWorkspaceState,
          isLoading: false,
          loading: false
        });
        return;
      }

      setWorkspaceData((prev) => ({ 
        ...prev, 
        isLoading: true,
        loading: true
      }));

      try {
        // Get all tenants for the user
        const tenants = await fetchTenants();
        
        if (tenants.length === 0) {
          // No tenants, reset to default state
          setWorkspaceData({
            ...initialWorkspaceState,
            tenants: [],
            isLoading: false,
            loading: false
          });
          return;
        }
        
        // Try to get the last active tenant from local storage
        const storedTenantId = localStorage.getItem('currentTenantId');
        let currentTenant = null;
        
        if (storedTenantId) {
          // Find the tenant in the list
          const matchedTenant = tenants.find((t) => t.id === storedTenantId);
          
          if (matchedTenant) {
            // Get detailed tenant info
            currentTenant = await fetchTenant(matchedTenant.id);
          }
        }
        
        // If no stored tenant or it wasn't found, use the first tenant
        if (!currentTenant && tenants.length > 0) {
          currentTenant = await fetchTenant(tenants[0].id);
          
          if (currentTenant) {
            localStorage.setItem('currentTenantId', currentTenant.id);
          }
        }

        const currentRole = currentTenant?.role;
        
        // Update workspace data
        setWorkspaceData({
          navigationItems: getNavigationItems(currentRole),
          currentTenant,
          tenant: currentTenant, // For backward compatibility
          currentRole, // For backward compatibility
          loading: false, // For backward compatibility
          userRole: currentRole, // For backward compatibility
          tenants,
          currentUrl: '',
          isLoading: false,
          setCurrentUrl: (url: string) => {
            setWorkspaceData(prev => ({ ...prev, currentUrl: url }));
          },
          switchTenant,
        });
      } catch (error) {
        console.error('Error loading workspace data:', error);
        setWorkspaceData((prev) => ({ 
          ...prev, 
          isLoading: false,
          loading: false
        }));
      }
    };

    loadWorkspaceData();
  }, [user]);

  return <WorkspaceContext.Provider value={workspaceData}>{children}</WorkspaceContext.Provider>;
};

// Hook to use the workspace context
export const useWorkspace = () => useContext(WorkspaceContext);

export default WorkspaceContext;
