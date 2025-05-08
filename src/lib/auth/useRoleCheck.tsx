
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from '@/types/shared';
import { toast } from '@/hooks/use-toast';

interface UseRoleCheckOptions {
  requiredRoles: UserRole[];
  redirectPath?: string;
  showToast?: boolean;
  toastMessage?: string;
}

/**
 * Hook to check if the user has the required role
 * If not, redirects to the specified path
 */
export function useRoleCheck({
  requiredRoles,
  redirectPath = '/unauthorized',
  showToast = true,
  toastMessage = 'You do not have permission to access this page'
}: UseRoleCheckOptions) {
  const { user } = useAuth();
  const { userRole, loading } = useWorkspace();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [checkComplete, setCheckComplete] = useState<boolean>(false);

  // Check if the user has the required role
  useEffect(() => {
    if (!loading) {
      // Not logged in
      if (!user) {
        setHasAccess(false);
        setCheckComplete(true);
        return;
      }

      // Check if the user has the required role
      if (userRole && requiredRoles.includes(userRole)) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
        
        if (showToast) {
          toast({
            title: 'Access denied',
            description: toastMessage,
            variant: 'destructive',
          });
        }
        
        navigate(redirectPath, { replace: true });
      }
      
      setCheckComplete(true);
    }
  }, [user, userRole, loading, requiredRoles, redirectPath, navigate, showToast, toastMessage]);

  return { hasAccess, loading: !checkComplete };
}
