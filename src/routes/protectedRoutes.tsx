
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { TenantGuard } from '@/components/auth/TenantGuard';
import MainLayout from '@/components/layout/MainLayout';
import { UserRole } from '@/types/shared';

interface ProtectedRouteProps {
  element: React.ReactNode;
  roles?: UserRole[];
  tenantScoped?: boolean;
  path: string;
}

/**
 * Higher-order component to wrap routes with appropriate authentication guards
 * @param element React component to render if authentication passes
 * @param roles Optional array of roles that are allowed to access this route
 * @param tenantScoped Whether the route should be scoped to the current tenant
 * @param path The route path (for debugging purposes)
 * @returns Protected route with appropriate guards
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  roles = [],
  tenantScoped = true,
  path
}) => {
  // All protected routes require authentication first
  const protectedElement = (
    <AuthGuard roles={[]}>
      {roles.length > 0 ? (
        // Add role guard if roles are specified
        <RoleGuard roles={roles} tenantScoped={tenantScoped}>
          {tenantScoped ? (
            // Add tenant guard if tenant scoped
            <TenantGuard>
              {element}
            </TenantGuard>
          ) : (
            element
          )}
        </RoleGuard>
      ) : (
        tenantScoped ? (
          // Add tenant guard if tenant scoped
          <TenantGuard>
            {element}
          </TenantGuard>
        ) : (
          element
        )
      )}
    </AuthGuard>
  );
  
  return protectedElement;
};

/**
 * Creates a protected route with MainLayout
 */
export const ProtectedMainRoute: React.FC<ProtectedRouteProps> = (props) => {
  return (
    <ProtectedRoute {...props} element={
      <MainLayout>
        {props.element}
      </MainLayout>
    } />
  );
};

/**
 * Creates a route that redirects to login if not authenticated
 */
export const AuthenticatedRedirect: React.FC<{
  from: string;
  to: string;
}> = ({ from, to }) => {
  return (
    <AuthGuard roles={[]}>
      <Navigate from={from} to={to} replace />
    </AuthGuard>
  );
};
