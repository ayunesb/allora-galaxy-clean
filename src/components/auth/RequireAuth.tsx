
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from '@/components/ui/use-toast';
import LoadingScreen from '@/components/LoadingScreen';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLoading: workspaceLoading, currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to access this page',
        variant: 'destructive'
      });
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || workspaceLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
