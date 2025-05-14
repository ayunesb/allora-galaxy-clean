
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { verifyTenantAccess } from '@/lib/auth/tenantSecurity';
import { useTenantId } from '@/hooks/useTenantId';
import LoadingScreen from '@/components/LoadingScreen';
import { UserRole } from '@/types/shared';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
  tenantScoped?: boolean;
  redirectTo?: string;
}

/**
 * RoleGuard component that restricts access based on user roles
 * Can be scoped to tenant-specific roles if tenantScoped is true
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  tenantScoped = true,
  redirectTo = '/unauthorized'
}) => {
  const { user, userRole, isLoading } = useAuth();
  const tenantId = useTenantId();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }
      
      // For global roles (not tenant-scoped)
      if (!tenantScoped) {
        // Admin and owner have unrestricted access
        if (userRole === 'admin' || userRole === 'owner') {
          setHasAccess(true);
          return;
        }
        
        // Check if the user has any of the required roles
        setHasAccess(roles.includes(userRole as UserRole));
        return;
      }
      
      // For tenant-scoped roles
      if (!tenantId) {
        setHasAccess(false);
        return;
      }
      
      // Use the tenant security helper to verify access
      const hasRole = await verifyTenantAccess(
        tenantId, 
        roles as string[], 
        false // Don't show toast messages
      );
      
      setHasAccess(hasRole);
    };
    
    if (!isLoading) {
      checkAccess();
    }
  }, [user, userRole, isLoading, roles, tenantScoped, tenantId]);
  
  if (isLoading || hasAccess === null) {
    return <LoadingScreen />;
  }
  
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default RoleGuard;
