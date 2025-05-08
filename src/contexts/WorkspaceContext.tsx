
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NavigationItem, WorkspaceContextType, WorkspaceData } from './workspace/types';
import { navigationItems } from './workspace/navigationItems';
import { toast } from '@/hooks/use-toast';

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
const initialWorkspaceData: WorkspaceData = {
  navigationItems: navigationItems,
  currentTenant: null,
  tenants: [],
  isLoading: true,
};

// Workspace context provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>(initialWorkspaceData);
  const [currentUrl, setCurrentUrl] = useState<string>('');

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
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role, tenants:tenant_id(id, name, slug)')
        .eq('user_id', user?.id);

      if (tenantError) {
        console.error('Error fetching user tenants:', tenantError);
        return [];
      }

      return tenantData.map((item) => ({
        id: item.tenants.id,
        name: item.tenants.name,
        slug: item.tenants.slug,
        role: item.role,
      }));
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
        setWorkspaceData(initialWorkspaceData);
        return;
      }

      setWorkspaceData((prev) => ({ ...prev, isLoading: true }));

      try {
        // Get all tenants for the user
        const tenants = await fetchTenants();
        
        if (tenants.length === 0) {
          // No tenants, reset to default state
          setWorkspaceData({
            navigationItems: navigationItems,
            currentTenant: null,
            tenants: [],
            isLoading: false,
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
        
        // Update workspace data
        setWorkspaceData({
          navigationItems: getNavigationItems(currentTenant?.role),
          currentTenant,
          tenants,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error loading workspace data:', error);
        setWorkspaceData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadWorkspaceData();
  }, [user]);

  const value = {
    ...workspaceData,
    currentUrl,
    setCurrentUrl,
    switchTenant,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// Hook to use the workspace context
export const useWorkspace = () => useContext(WorkspaceContext);

export default WorkspaceContext;
