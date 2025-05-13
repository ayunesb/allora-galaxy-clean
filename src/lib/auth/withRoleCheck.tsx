
import { ComponentType, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTenantId } from '@/hooks/useTenantId';

export interface WithRoleCheckProps {
  [key: string]: any;
}

export function withRoleCheck<T extends WithRoleCheckProps>(
  Component: ComponentType<T>,
  roles: string[],
  redirectTo = '/unauthorized'
) {
  return function WithRoleCheck(props: T) {
    const { user, isAuthenticated, checkUserRole } = useAuth();
    const { tenantId } = useTenantId();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAccess = async () => {
        if (!isAuthenticated || !user || !tenantId) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        try {
          const hasRole = await checkUserRole(tenantId, roles);
          setHasAccess(Boolean(hasRole));
        } catch (error) {
          console.error('Error checking user role:', error);
          setHasAccess(false);
        } finally {
          setLoading(false);
        }
      };

      checkAccess();
    }, [user, isAuthenticated, tenantId, roles, checkUserRole]);

    if (loading) {
      // You could return a loading spinner here
      return <div>Loading...</div>;
    }

    if (!hasAccess) {
      return <Navigate to={redirectTo} replace />;
    }

    return <Component {...props} />;
  };
}

export default withRoleCheck;
