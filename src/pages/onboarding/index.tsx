
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import { useTenantAvailability } from '@/hooks/useTenantAvailability';
import { useAuth } from '@/context/AuthContext';
import PageHelmet from '@/components/PageHelmet';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const OnboardingPage: React.FC = () => {
  const { tenantId, isAvailable, isLoading: tenantLoading } = useTenantAvailability();
  const { user, loading: authLoading } = useAuth();
  const { loading: workspaceLoading } = useWorkspace();
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Show loading while authentication or workspace data is loading
  if (authLoading || workspaceLoading || tenantLoading) {
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
  if (isAvailable && tenantId) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Start the onboarding process
  const handleStartOnboarding = () => {
    setShowWelcome(false);
  };
  
  return (
    <>
      <PageHelmet 
        title="Onboarding"
        description="Set up your Allora OS workspace and get started"
      />
      <div className="min-h-screen px-4 sm:px-0">
        {showWelcome ? (
          <WelcomeScreen onStart={handleStartOnboarding} />
        ) : (
          <OnboardingWizard />
        )}
      </div>
    </>
  );
};

export default OnboardingPage;
