
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'pending';

// Role hierarchy (higher index = higher permissions)
const ROLE_HIERARCHY: UserRole[] = ['pending', 'viewer', 'member', 'admin', 'owner'];

/**
 * Hook to check if the current user has a required role or higher in the current tenant
 * @param requiredRole The minimum role required
 * @returns Object containing role check result and loading status
 */
export function useRequireRole(requiredRole: UserRole) {
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    async function checkUserRole() {
      setLoading(true);
      
      if (!user || !currentTenant) {
        setUserRole(null);
        setHasRequiredRole(false);
        setLoading(false);
        return;
      }

      try {
        // Fetch the user's role in the current tenant
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('tenant_id', currentTenant.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
          setHasRequiredRole(false);
          return;
        }

        const currentUserRole = data?.role as UserRole;
        setUserRole(currentUserRole);
        
        // Check if the user's role meets or exceeds the required role
        const userRoleIndex = ROLE_HIERARCHY.indexOf(currentUserRole);
        const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);
        
        setHasRequiredRole(userRoleIndex >= requiredRoleIndex);
      } catch (err) {
        console.error('Error in useRequireRole:', err);
        setHasRequiredRole(false);
      } finally {
        setLoading(false);
      }
    }

    checkUserRole();
  }, [user, currentTenant, requiredRole]);

  return { hasRequiredRole, userRole, loading };
}

/**
 * Higher-level function to check if a user has a required role or higher
 * @param role The minimum role required
 * @returns function that evaluates if the user's role meets the requirement
 */
export function requireRole(role: UserRole) {
  return (): boolean => {
    const { hasRequiredRole, loading } = useRequireRole(role);
    return !loading && hasRequiredRole;
  };
}

export default requireRole;
