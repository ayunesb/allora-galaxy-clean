
import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/shared';

interface RenderIfHasRoleProps {
  children: React.ReactNode;
  roles: UserRole[] | UserRole;
  tenantScoped?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on user role
 */
export const RenderIfHasRole: React.FC<RenderIfHasRoleProps> = ({
  children,
  roles,
  tenantScoped = true,
  fallback = null
}) => {
  const { hasGlobalRole, hasTenantRole } = useRBAC();
  
  // Determine which role check to use
  const hasPermission = tenantScoped 
    ? hasTenantRole(roles)
    : hasGlobalRole(roles);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default RenderIfHasRole;
