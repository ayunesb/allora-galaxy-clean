
import React from 'react';
import { Navigate } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useTenantAvailability } from '@/hooks/useTenantId';
import { useAuth } from '@/context/AuthContext';
import PageHelmet from '@/components/PageHelmet';
import { useWorkspace } from '@/context/WorkspaceContext';

const OnboardingPage: React.FC = () => {
  const { tenantId, isAvailable } = useTenantAvailability();
  const { user, loading: authLoading } = useAuth();
  const { loading: workspaceLoading } = useWorkspace();
  
  // Show loading while authentication or workspace data is loading
  if (authLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If tenant is already available, redirect to dashboard
  if (isAvailable) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <>
      <PageHelmet 
        title="Onboarding"
        description="Set up your Allora OS workspace and get started"
      />
      <div className="min-h-screen px-4 sm:px-0">
        <OnboardingWizard />
      </div>
    </>
  );
};

export default OnboardingPage;
