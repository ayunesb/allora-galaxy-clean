
import { useState, useEffect, useCallback } from 'react';
import { WorkspaceContextType } from './types';
import { getUserTenants } from './workspaceUtils';
import { Tenant } from '@/types/tenant';
import { UserRole } from '@/types/shared';
import { getNavigationItems } from './navigationItems';

export const initialWorkspaceState: WorkspaceContextType = {
  tenant: null,
  tenantId: null,
  userRole: null,
  tenantsList: [],
  loading: true,
  isLoading: true,
  error: null,
  setTenantId: () => {},
  setUserRole: () => {},
  refreshTenant: () => {},
  navigationItems: []
};

export const useWorkspaceState = (userId: string | undefined): WorkspaceContextType => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTenantData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user's tenants
      const tenants = await getUserTenants(userId);
      
      if (!tenants || tenants.length === 0) {
        // User has no tenants
        setTenant(null);
        setTenantId(null);
        setUserRole(null);
        setTenantsList([]);
        setLoading(false);
        return;
      }
      
      // Set the tenants list
      setTenantsList(tenants);
      
      // Use the currently selected tenant or default to the first one
      let selectedTenantId = tenantId;
      
      // If no tenant is selected or the selected tenant is not in the list, use the first one
      if (!selectedTenantId || !tenants.find(t => t.id === selectedTenantId)) {
        selectedTenantId = tenants[0].id;
        setTenantId(selectedTenantId);
      }
      
      // Find the current tenant and role
      const currentTenant = tenants.find(t => t.id === selectedTenantId);
      
      if (currentTenant) {
        setTenant({
          id: currentTenant.id,
          name: currentTenant.name,
          slug: currentTenant.slug,
          role: currentTenant.role // Include role in tenant object
        } as Tenant);
        setUserRole(currentTenant.role as UserRole);
      } else {
        setTenant(null);
        setUserRole(null);
      }
    } catch (err) {
      console.error('Error loading workspace data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load workspace data'));
    } finally {
      setLoading(false);
    }
  }, [userId, tenantId]);

  // Initial load and when userId changes
  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  // Refresh tenant data
  const refreshTenant = useCallback(() => {
    loadTenantData();
  }, [loadTenantData]);

  // Generate navigation items based on user role
  const navigationItems = userRole ? getNavigationItems(userRole) : [];

  return {
    tenant,
    tenantId,
    userRole,
    tenantsList,
    loading,
    isLoading: loading, // Map loading to isLoading for backwards compatibility
    error,
    setTenantId,
    setUserRole,
    refreshTenant,
    navigationItems
  };
};
