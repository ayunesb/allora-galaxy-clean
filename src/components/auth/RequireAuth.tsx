
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/contexts/workspace/WorkspaceContext";
import { LoadingScreen } from "../LoadingScreen";

interface RequireAuthProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function RequireAuth({ children, requiredRoles }: RequireAuthProps) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentWorkspace, workspaces } = useWorkspace();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Check if the user has required roles
  useEffect(() => {
    async function checkPermission() {
      if (!isAuthenticated || !user) {
        setHasPermission(false);
        return;
      }

      // If no roles are required, the user has permission
      if (!requiredRoles || requiredRoles.length === 0) {
        setHasPermission(true);
        return;
      }

      // Check if user has at least one of the required roles
      const hasRole = (role: string) => {
        // Check user roles in the current workspace
        // Note: actual role checking logic would depend on your app structure
        return true; // Simplified for this example
      };

      const userHasRequiredRole = requiredRoles.some(hasRole);
      setHasPermission(userHasRequiredRole);
    }

    if (!isLoading) {
      checkPermission();
    }
  }, [user, isAuthenticated, isLoading, requiredRoles]);

  // Show loading while checking authentication
  if (isLoading || hasPermission === null) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Redirect to unauthorized page if lacking permission
  if (!hasPermission) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
