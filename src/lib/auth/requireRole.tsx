
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';

interface RequireRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * A component that restricts access based on user roles
 */
const RequireRole: React.FC<RequireRoleProps> = ({
  roles,
  children,
  fallback,
  redirectTo = '/unauthorized'
}) => {
  const { user, loading, checkUserRole } = useAuth();
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
    
    if (!loading) {
      checkPermission();
    }
  }, [user, loading, roles, checkUserRole]);

  if (loading || hasPermission === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
