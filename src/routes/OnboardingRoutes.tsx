
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import OnboardingLayout from '@/layouts/OnboardingLayout';

const OnboardingRoutes: React.FC = () => {
  return (
    <OnboardingLayout>
      <Routes>
        <Route path="/*" element={<OnboardingWizard />} />
      </Routes>
    </OnboardingLayout>
  );
};

export default OnboardingRoutes;
