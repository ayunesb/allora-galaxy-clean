
import { useState, useEffect } from 'react';
import { WorkspaceContextType } from './types';
import { fetchTenants, getDefaultNavigationItems } from './workspaceUtils';

// Initial state for the workspace context
export const initialWorkspaceState: WorkspaceContextType = {
  tenant: null,
  isLoading: true,
  error: null,
  navigationItems: getDefaultNavigationItems(),
  refreshTenant: async () => {}
};

/**
 * Hook to manage workspace state
 * @param userId Current user ID
 */
export const useWorkspaceState = (userId?: string): WorkspaceContextType => {
  const [workspace, setWorkspace] = useState<WorkspaceContextType>(initialWorkspaceState);
  
  // Load workspace data when user ID changes
  useEffect(() => {
    if (userId) {
      loadWorkspaceData();
    } else {
      setWorkspace({
        ...initialWorkspaceState,
        isLoading: false
      });
    }
  }, [userId]);
  
  // Load tenants and other workspace data
  const loadWorkspaceData = async () => {
    try {
      setWorkspace(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch tenants for user
      const tenants = await fetchTenants(userId);
      const primaryTenant = tenants.length > 0 ? tenants[0] : null;
      
      // Get navigation items
      const navigationItems = getDefaultNavigationItems();
      
      setWorkspace({
        tenant: primaryTenant,
        navigationItems,
        isLoading: false,
        error: null,
        refreshTenant: loadWorkspaceData
      });
    } catch (err: any) {
      console.error('Error loading workspace data:', err);
      
      setWorkspace({
        tenant: null,
        navigationItems: getDefaultNavigationItems(),
        isLoading: false,
        error: err.message || 'Failed to load workspace data',
        refreshTenant: loadWorkspaceData
      });
    }
  };
  
  return {
    ...workspace,
    refreshTenant: loadWorkspaceData
  };
};
