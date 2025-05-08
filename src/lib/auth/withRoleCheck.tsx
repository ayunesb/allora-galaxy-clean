
import React from 'react';
import { useRoleCheck, UseRoleCheckOptions } from './useRoleCheck';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export type RoleCheckOptions = UseRoleCheckOptions;

export function withRoleCheck<P extends object>(
  Component: React.ComponentType<P>,
  options: RoleCheckOptions
): React.FC<P> {
  return (props: P) => {
    const { hasAccess, loading } = useRoleCheck(options);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="container mx-auto py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
