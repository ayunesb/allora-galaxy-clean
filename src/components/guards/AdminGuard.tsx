import React from 'react';
import { Navigate } from 'react-router-dom';
import { requireRole } from '@/lib/auth/requireRole';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  fallback, 
  redirectTo = '/unauthorized' 
}) => {
  const navigate = useNavigate();
  const hasPermission = requireRole('admin');
  
  if (!hasPermission) {
    // If a fallback is provided, render it instead of redirecting
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Otherwise, redirect to the specified route
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

// Fallback component when access is denied
export const AccessDeniedFallback: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Alert className="max-w-md">
        <AlertTitle className="text-lg">Access Denied</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            You don't have permission to view this page. This area requires administrator privileges.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            Return to Dashboard
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
