
import { useEffect, useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { UserRole, RoleCheckOptions, checkRolePermission } from './roleTypes';

/**
 * Hook to check if the current user has the required role
 * @param options - Configuration options
 * @returns Object containing the role check result and loading state
 */
export const useRoleCheck = (options: RoleCheckOptions) => {
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
      const hasRequiredRole = checkRolePermission(currentRole as UserRole, requiredRole);
      setHasAccess(hasRequiredRole);
      
      // Handle access denied cases
      if (!hasRequiredRole && !silent) {
        const roleDescription = Array.isArray(requiredRole)
          ? requiredRole.join(' or ')
          : requiredRole;
          
        toast({
          title: "Access denied",
          description: `You need to be a ${roleDescription} to access this resource.`,
          variant: "destructive",
        });
        
        navigate(redirectTo);
      }
      
      setChecking(false);
    };

    checkAccess();
  }, [user, currentRole, requiredRole, authLoading, workspaceLoading, redirectTo, silent, navigate, toast]);

  return { hasAccess, checking };
};

// Fix re-exports with proper "export type" syntax
export { withRoleCheck } from './withRoleCheck';
export type { UserRole, RoleCheckOptions } from './roleTypes';
export default useRoleCheck;
