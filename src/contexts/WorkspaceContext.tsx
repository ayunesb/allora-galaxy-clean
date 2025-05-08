
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/auth/roleTypes';
import { Tenant, WorkspaceContextType } from './workspace/types';
import { navigationItems } from './workspace/navigationItems';

const defaultContext: WorkspaceContextType = {
  tenant: null,
  currentTenant: null,
  setTenant: () => {},
  loading: true,
  isLoading: true,
  navigationItems,
  currentRole: null,
  userRole: null,
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
    userRole: currentRole, // Ensure userRole is set to match currentRole
    refreshTenant,
    error
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
};

export type { Tenant, WorkspaceContextType };
export default WorkspaceContext;
