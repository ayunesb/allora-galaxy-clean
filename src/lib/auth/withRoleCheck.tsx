
import React from 'react';
import { useRoleCheck } from './useRoleCheck';
import { RoleCheckOptions } from './roleTypes';

/**
 * Higher-order component guard that checks if the current user has the required role
 * @param Component - The component to wrap
 * @param options - Configuration options for role checking
 * @returns The wrapped component that respects role permissions
 */
export function withRoleCheck<P extends object>(
  Component: React.ComponentType<P>,
  options: RoleCheckOptions
) {
  return function WithRoleCheck(props: P) {
    const { hasAccess, checking } = useRoleCheck(options);
    
    if (checking) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (!hasAccess) {
      return null;
    }
    
    return <Component {...props} />;
  };
}

export default withRoleCheck;
