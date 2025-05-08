
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirect?: boolean;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  fallback,
  redirect = true,
}) => {
  const { currentRole, loading } = useWorkspace();
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  // Check if user has admin privileges
  const isAdmin = currentRole === 'owner' || currentRole === 'admin';
  
  if (!isAdmin) {
    // Redirect to unauthorized page
    if (redirect) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Show fallback UI if provided
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default fallback UI
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page. Please contact an administrator.
          </AlertDescription>
        </Alert>
        
        <Button variant="secondary" asChild>
          <a href="/">Return to Dashboard</a>
        </Button>
      </div>
    );
  }
  
  // User has admin rights, render children
  return <>{children}</>;
};

export default AdminGuard;
