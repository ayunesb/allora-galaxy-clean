
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Options for the useRoleCheck hook
 */
export interface UseRoleCheckOptions {
  /** Array of role names that should be granted access */
  roles?: string[];
  /** Whether to scope role checks to a specific tenant */
  tenantScoped?: boolean;
  /** Tenant ID to check roles against (required if tenantScoped is true) */
  tenantId?: string;
}

/**
 * A hook that checks if the current user has any of the specified roles
 * 
 * This hook verifies user permissions based on their assigned roles,
 * either globally or within a specific tenant. It handles loading states
 * and caches the result for performance.
 * 
 * @param options Configuration options for the role check
 * @returns Object containing access status, loading state, and user roles
 * 
 * @example
 * ```tsx
 * // Check for global admin access
 * const { hasAccess, loading } = useRoleCheck({
 *   roles: ['admin', 'super_admin']
 * });
 * 
 * // Check for tenant-specific roles
 * const { hasAccess, loading, userRoles } = useRoleCheck({
 *   roles: ['editor', 'owner'],
 *   tenantScoped: true,
 *   tenantId: 'tenant-123'
 * });
 * 
 * if (loading) {
 *   return <LoadingSpinner />;
 * }
 * 
 * return hasAccess ? <ProtectedContent /> : <AccessDenied />;
 * ```
 */
export function useRoleCheck(options: UseRoleCheckOptions = {}) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (!session) {
          setHasAccess(false);
          return;
        }

        // If no specific roles required, user just needs to be authenticated
        if (!options.roles || options.roles.length === 0) {
          setHasAccess(true);
          return;
        }

        // If tenant scoped, we need to check the user's role for that tenant
        if (options.tenantScoped) {
          const tenantId = options.tenantId;
          
          if (!tenantId) {
            console.error('Tenant scoped role check requires a tenantId');
            setHasAccess(false);
            return;
          }
          
          // Get the user's role for this tenant
          const { data: roleData } = await supabase
            .from('tenant_user_roles')
            .select('role')
            .eq('tenant_id', tenantId)
            .eq('user_id', session.user.id)
            .single();
          
          if (roleData) {
            const userRole = roleData.role;
            setUserRoles([userRole]);
            
            // Check if the user's role is in the allowed roles
            setHasAccess(options.roles.includes(userRole));
          } else {
            setHasAccess(false);
          }
        } else {
          // Global role check from user's claims
          const userRole = session.user.app_metadata?.role || 'user';
          setUserRoles([userRole]);
          
          // Check if the user's role is in the allowed roles
          setHasAccess(options.roles.includes(userRole));
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [options.roles, options.tenantScoped, options.tenantId]);

  return { hasAccess, loading, userRoles };
}
