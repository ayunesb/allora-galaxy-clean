
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useTenantAvailability } from '@/hooks/useTenantId';
import { useAuth } from '@/context/AuthContext';
import PageHelmet from '@/components/PageHelmet';

const OnboardingPage: React.FC = () => {
  const { tenantId, isAvailable } = useTenantAvailability();
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
      <div className="min-h-screen">
        <OnboardingWizard />
      </div>
    </>
  );
};

export default OnboardingPage;
