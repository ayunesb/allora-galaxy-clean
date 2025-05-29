import React from "react";
import { Route, Routes } from "react-router-dom";
import OnboardingStep from "@/components/onboarding/OnboardingWizard";
import OnboardingLayout from "@/layouts/OnboardingLayout";

const onboardingSteps: Array<ReturnType<typeof OnboardingStep>> = []; // Replace with actual steps if available
const handleOnboardingComplete = () => {}; // Replace with actual handler if needed
const tenantId = ""; // Replace with actual tenantId if available

const OnboardingRoutes: React.FC = () => {
  return (
    <OnboardingLayout>
      <Routes>
        <Route
          path="/*"
          element={
            <OnboardingStep
              steps={onboardingSteps}
              onComplete={handleOnboardingComplete}
              tenantId={tenantId}
            />
          }
        />
      </Routes>
    </OnboardingLayout>
  );
};

export default OnboardingRoutes;
