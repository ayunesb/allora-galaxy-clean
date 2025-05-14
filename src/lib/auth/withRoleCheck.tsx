
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';

interface WithRoleCheckProps {
  roles: UserRole[] | string[];
  redirectTo?: string;
}

/**
 * Higher-order component that restricts access based on user roles
 */
const withRoleCheck = <P extends object>(
  Component: React.ComponentType<P>,
  { roles, redirectTo = '/unauthorized' }: WithRoleCheckProps
) => {
  const WithRoleCheck: React.FC<P> = (props) => {
    const { user, isLoading, checkUserRole } = useAuth();
    const location = useLocation();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
      const checkPermission = async () => {
        if (!user) {
          setHasPermission(false);
          return;
        }
        
        try {
          for (const role of roles) {
            const hasRole = await checkUserRole(role.toString());
            if (hasRole) {
              setHasPermission(true);
              return;
            }
          }
          setHasPermission(false);
        } catch (error) {
          console.error('Error checking role:', error);
          setHasPermission(false);
        }
      };
      
      if (!isLoading) {
        checkPermission();
      }
    }, [user, isLoading]);

    if (isLoading || hasPermission === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!hasPermission) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <Component {...props} />;
  };

  return WithRoleCheck;
};

export default withRoleCheck;
