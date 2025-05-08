
import { useState, useEffect } from 'react';
import { fetchTenant, fetchTenants, getNavigationItems } from './workspaceUtils';
import { toast } from '@/hooks/use-toast';
import { WorkspaceContextType } from './types';
import { navigationItems } from './navigationItems';

// Initial workspace state
export const initialWorkspaceState: WorkspaceContextType = {
  navigationItems,
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

export const useWorkspaceState = (userId: string | undefined) => {
  const [workspaceData, setWorkspaceData] = useState<WorkspaceContextType>(initialWorkspaceState);

  // Switch to a different tenant
  const switchTenant = async (tenantId: string): Promise<boolean> => {
    try {
      setWorkspaceData((prev) => ({ ...prev, isLoading: true }));
      
      const tenant = await fetchTenant(tenantId, userId);
      
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
      if (!userId) {
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
        const tenants = await fetchTenants(userId);
        
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
            currentTenant = await fetchTenant(matchedTenant.id, userId);
          }
        }
        
        // If no stored tenant or it wasn't found, use the first tenant
        if (!currentTenant && tenants.length > 0) {
          currentTenant = await fetchTenant(tenants[0].id, userId);
          
          if (currentTenant) {
            localStorage.setItem('currentTenantId', currentTenant.id);
          }
        }

        const currentRole = currentTenant?.role;

        // Set URL change function
        const setCurrentUrl = (url: string) => {
          setWorkspaceData(prev => ({ ...prev, currentUrl: url }));
        };
        
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
          setCurrentUrl,
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
  }, [userId]);

  return workspaceData;
};
