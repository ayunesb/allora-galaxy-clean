
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { isTenantMember } from '@/lib/auth/tenantSecurity';
import LoadingScreen from '@/components/LoadingScreen';

interface TenantGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * TenantGuard component that restricts access to authorized tenant members only
 */
export const TenantGuard: React.FC<TenantGuardProps> = ({
  children,
  redirectTo = '/unauthorized'
}) => {
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkTenantAccess = async () => {
      if (!currentWorkspace?.id) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }
      
      try {
        const isMember = await isTenantMember(currentWorkspace.id);
        setHasAccess(isMember);
      } catch (error) {
        console.error('Error checking tenant membership:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    if (!workspaceLoading) {
      checkTenantAccess();
    }
  }, [currentWorkspace, workspaceLoading]);
  
  if (workspaceLoading || isChecking) {
    return <LoadingScreen />;
  }
  
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default TenantGuard;
