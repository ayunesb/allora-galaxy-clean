
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import LoadingScreen from '@/components/LoadingScreen';

const ProtectedRoute = () => {
  const { user, loading: authLoading } = useAuth();
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
