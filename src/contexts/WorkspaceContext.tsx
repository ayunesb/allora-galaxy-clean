
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/auth/roleTypes';
import { NavigationItem } from '@/types/navigation';

export interface WorkspaceContextType {
  tenant: Tenant | null;
  currentTenant: Tenant | null; // Alias for compatibility
  setTenant: (tenant: Tenant | null) => void;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  navigationItems: NavigationItem[];
  currentRole: UserRole | null;
  refreshTenant: () => Promise<void>;
  error: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  settings?: Record<string, any>;
  role?: UserRole;
  metadata?: Record<string, any>;
  created_at?: string;
}

const defaultContext: WorkspaceContextType = {
  tenant: null,
  currentTenant: null,
  setTenant: () => {},
  loading: true,
  isLoading: true,
  navigationItems: [],
  currentRole: null,
  refreshTenant: async () => {},
  error: null
};

const WorkspaceContext = createContext<WorkspaceContextType>(defaultContext);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  // Define navigation items
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'layout-dashboard'
    },
    {
      id: 'galaxy',
      label: 'Galaxy',
      path: '/galaxy',
      icon: 'grid-3x3'
    },
    {
      id: 'launch',
      label: 'Launch',
      path: '/launch',
      icon: 'rocket'
    },
    {
      id: 'agents',
      label: 'Agents',
      path: '/agents/performance',
      icon: 'bot'
    },
    {
      id: 'plugins',
      label: 'Plugins',
      path: '/plugins',
      icon: 'plug'
    },
    {
      id: 'insights',
      label: 'Insights',
      path: '/insights/kpis',
      icon: 'bar-chart'
    },
    {
      id: 'admin',
      label: 'Admin',
      path: '/admin',
      icon: 'settings',
      children: [
        {
          id: 'users',
          label: 'Users',
          path: '/admin/users',
          icon: 'users'
        },
        {
          id: 'ai-decisions',
          label: 'AI Decisions',
          path: '/admin/ai-decisions',
          icon: 'brain'
        },
        {
          id: 'system-logs',
          label: 'System Logs',
          path: '/admin/system-logs',
          icon: 'list'
        },
        {
          id: 'plugin-logs',
          label: 'Plugin Logs',
          path: '/admin/plugin-logs',
          icon: 'clipboard-list'
        }
      ]
    }
  ];

  // Fetch tenant and role data
  const fetchTenantData = async () => {
    if (!user || authLoading) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data: roleData, error: roleError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching user role:', roleError);
        setLoading(false);
        setError(roleError.message);
        return;
      }

      if (roleData?.tenant_id) {
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', roleData.tenant_id)
          .single();

        if (tenantError) {
          console.error('Error fetching tenant:', tenantError);
          setError(tenantError.message);
        } else if (tenantData) {
          const tenantWithRole = {
            ...tenantData,
            role: roleData.role as UserRole
          };
          setTenant(tenantWithRole);
          setCurrentRole(roleData.role as UserRole);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch workspace data:', err);
      setError(err.message || 'An error occurred while fetching workspace data');
    } finally {
      setLoading(false);
    }
  };

  const refreshTenant = async () => {
    setLoading(true);
    await fetchTenantData();
  };

  useEffect(() => {
    fetchTenantData();
  }, [user, authLoading]);

  const contextValue: WorkspaceContextType = {
    tenant,
    currentTenant: tenant,
    setTenant,
    loading,
    isLoading: loading,
    navigationItems,
    currentRole,
    refreshTenant,
    error
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);

export default WorkspaceContext;
