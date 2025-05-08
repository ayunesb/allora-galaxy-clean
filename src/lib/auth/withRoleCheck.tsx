
import React from 'react';
import { UserRole } from '@/types/shared';
import RequireRole from './requireRole';

export interface UseRoleCheckOptions {
  roles: UserRole[];
  redirectTo?: string;
}

export function withRoleCheck<P extends object>(
  Component: React.ComponentType<P>,
  options: UseRoleCheckOptions
) {
  const WithRoleCheck = (props: P) => {
    return (
      <RequireRole roles={options.roles} redirectTo={options.redirectTo}>
        <Component {...props} />
      </RequireRole>
    );
  };

  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithRoleCheck.displayName = `withRoleCheck(${displayName})`;

  return WithRoleCheck;
}
