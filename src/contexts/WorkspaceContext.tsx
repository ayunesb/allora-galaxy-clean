
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/auth/roleTypes';
import { NavigationItem } from '@/types/navigation';

interface Tenant {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  metadata?: Record<string, any>;
  role?: UserRole;
}

interface WorkspaceContextType {
  tenant: Tenant | null;
  currentTenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  loading: boolean;
  isLoading: boolean;
  navigationItems: NavigationItem[];
  currentRole: UserRole | null;
  userRole: UserRole | null;
  refreshTenant: () => Promise<void>;
  error: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Default navigation items
  const navigationItems: NavigationItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Galaxy', href: '/galaxy', icon: 'galaxy' },
    { label: 'Plugins', href: '/plugins', icon: 'plugin' },
    { label: 'Insights', href: '/insights/kpis', icon: 'insights' },
    { label: 'Settings', href: '/settings', icon: 'settings' }
  ];

  const fetchTenant = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First get the tenant_id and role from tenant_user_roles
      const { data: userTenant, error: userTenantError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userTenantError) throw userTenantError;

      // If tenant_id is found, get the tenant details
      if (userTenant?.tenant_id) {
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', userTenant.tenant_id)
          .maybeSingle();

        if (tenantError) throw tenantError;

        if (tenantData) {
          const tenantWithRole = {
            ...tenantData,
            role: userTenant.role as UserRole
          };
          setTenant(tenantWithRole);
          setCurrentRole(userTenant.role as UserRole);
        } else {
          setTenant(null);
          setCurrentRole(null);
        }
      } else {
        setTenant(null);
        setCurrentRole(null);
      }
    } catch (err: any) {
      console.error('Error fetching workspace tenant:', err);
      setError(err.message || 'Failed to load workspace');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [user]);

  const refreshTenant = async () => {
    await fetchTenant();
  };

  return (
    <WorkspaceContext.Provider 
      value={{ 
        tenant, 
        currentTenant: tenant, 
        setTenant, 
        loading: isLoading, 
        isLoading, 
        navigationItems,
        currentRole,
        userRole: currentRole,
        refreshTenant,
        error 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
};

export default WorkspaceContext;
