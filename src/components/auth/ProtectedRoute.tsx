
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import LoadingScreen from '@/components/LoadingScreen';

const ProtectedRoute = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: workspaceLoading } = useWorkspace();

  if (authLoading || workspaceLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
