
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireRole } from '@/lib/auth/requireRole';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export const AdminGuard = ({
  children,
  fallback,
  redirectTo = '/unauthorized',
}: AdminGuardProps) => {
  const navigate = useNavigate();
  const { hasRequiredRole, loading } = useRequireRole('admin');

  useEffect(() => {
    // Only redirect if we're done loading and user doesn't have required role
    if (!loading && !hasRequiredRole && redirectTo) {
      navigate(redirectTo);
    }
  }, [hasRequiredRole, loading, navigate, redirectTo]);

  // Show a skeleton loader while checking permissions
  if (loading) {
    return (
      <div className="space-y-3 p-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  // If permission check fails and we have a fallback, show it instead of redirecting
  if (!hasRequiredRole && fallback) {
    return <>{fallback}</>;
  }

  // Show warning if permission check fails but we don't want to redirect
  if (!hasRequiredRole && !redirectTo) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unauthorized Access</AlertTitle>
        <AlertDescription>
          You don't have permission to view this content. Please contact your administrator for access.
        </AlertDescription>
      </Alert>
    );
  }

  // If user has required role, render the children
  return <>{children}</>;
};

export default AdminGuard;
