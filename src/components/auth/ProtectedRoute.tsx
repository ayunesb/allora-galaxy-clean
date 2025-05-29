import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const ProtectedRoute: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: workspaceLoading } = useWorkspace();

  // Show loading state while checking authentication
  if (authLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
