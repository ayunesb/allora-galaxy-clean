
import { useEffect, useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

const roleHierarchy: Record<UserRole, number> = {
  'owner': 4,
  'admin': 3,
  'member': 2,
  'viewer': 1,
};

export interface UseRoleCheckOptions {
  requiredRole: UserRole | UserRole[];
  redirectTo?: string;
  silent?: boolean;
}

/**
 * Hook to check if the current user has the required role
 * @param options - Configuration options
 * @returns Object containing the role check result and loading state
 */
export const useRoleCheck = (options: UseRoleCheckOptions) => {
  const { requiredRole, redirectTo = '/unauthorized', silent = false } = options;
  const { user, loading: authLoading } = useAuth();
  const { currentRole, loading: workspaceLoading } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkAccess = () => {
      setChecking(true);

      // Wait for auth and workspace data to load
      if (authLoading || workspaceLoading) {
        return;
      }

      // User must be authenticated
      if (!user) {
        setHasAccess(false);
        setChecking(false);
        
        if (!silent) {
          navigate('/auth', { state: { returnUrl: window.location.pathname } });
        }
        return;
      }

      // User must have a role
      if (!currentRole) {
        setHasAccess(false);
        setChecking(false);
        
        if (!silent) {
          toast({
            title: "Access denied",
            description: "You don't have the required permissions to access this resource.",
            variant: "destructive",
          });
          
          navigate(redirectTo);
        }
        return;
      }

      // Check if user has the required role
      const userRoleLevel = roleHierarchy[currentRole as UserRole] || 0;
      
      if (Array.isArray(requiredRole)) {
        // If any role in the array is satisfied, grant access
        const hasRequiredRole = requiredRole.some(role => {
          const requiredRoleLevel = roleHierarchy[role];
          return userRoleLevel >= requiredRoleLevel;
        });
        
        setHasAccess(hasRequiredRole);
        
        if (!hasRequiredRole && !silent) {
          toast({
            title: "Access denied",
            description: `You need to be a ${requiredRole.join(' or ')} to access this resource.`,
            variant: "destructive",
          });
          
          navigate(redirectTo);
        }
      } else {
        // Check against a single role
        const requiredRoleLevel = roleHierarchy[requiredRole];
        const hasRequiredRole = userRoleLevel >= requiredRoleLevel;
        
        setHasAccess(hasRequiredRole);
        
        if (!hasRequiredRole && !silent) {
          toast({
            title: "Access denied",
            description: `You need to be a ${requiredRole} to access this resource.`,
            variant: "destructive",
          });
          
          navigate(redirectTo);
        }
      }
      
      setChecking(false);
    };

    checkAccess();
  }, [user, currentRole, requiredRole, authLoading, workspaceLoading, redirectTo, silent, navigate]);

  return { hasAccess, checking };
};

/**
 * Component guard that checks if the current user has the required role
 * @param props - Component props
 * @returns The component if the user has access, or null
 */
export const withRoleCheck = <P extends object>(
  Component: React.ComponentType<P>,
  options: UseRoleCheckOptions
) => {
  return function WithRoleCheck(props: P) {
    const { hasAccess, checking } = useRoleCheck(options);
    
    if (checking) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
    }
    
    if (!hasAccess) {
      return null;
    }
    
    return <Component {...props} />;
  };
};

export default useRoleCheck;
