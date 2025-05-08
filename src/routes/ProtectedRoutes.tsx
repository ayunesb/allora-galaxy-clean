
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { useWorkspace } from '@/context/WorkspaceContext';
import LoadingScreen from '@/components/LoadingScreen';
import NotFound from '@/pages/NotFound';

/**
 * Protected route component that checks if user is authenticated
 * and redirects to login if not
 */
export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const { tenant, isLoading: isTenantLoading } = useWorkspace();

  if (isLoading || isTenantLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/auth/login" replace />;
  }

  if (!tenant && !isTenantLoading) {
    // Redirect to onboarding if user has no workspace
    return <Navigate to="/onboarding" replace />;
  }

  // User is authenticated, render the protected content
  return <Outlet />;
};

/**
 * Main application route with standard layout
 */
export const MainRoute = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

/**
 * Admin route component that checks if user has admin privileges
 */
export const AdminRoute = () => {
  const { user } = useAuth();
  const { tenant, userRole, isLoading } = useWorkspace();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if user has admin privileges
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  if (!isAdmin) {
    // Redirect to unauthorized page if not admin
    return <NotFound />;
  }

  // User is admin, render admin content
  return (
    <AdminLayout children={<Outlet />} />
  );
};
