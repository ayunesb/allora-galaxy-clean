
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UseRoleCheckOptions {
  roles?: string[];
  tenantScoped?: boolean;
  tenantId?: string;
}

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
