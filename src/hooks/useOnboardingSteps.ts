import { useState } from "react";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

export interface OnboardingStepItem {
  id: string;
  label: string;
}

export function useOnboardingSteps(
  validateCurrentStep: () => { valid: boolean; errors: Record<string, string> },
) {
  const [currentStep, setCurrentStep] = useState(0);

  // Define steps
  const steps: OnboardingStepItem[] = [
    { id: "company-info", label: "Company Info" },
    { id: "persona", label: "Target Persona" },
    { id: "additional-info", label: "Additional Info" },
    { id: "strategy-generation", label: "Strategy" },
  ];

  // Navigate to next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      // Validate current step before proceeding
      const validationResult = validateCurrentStep();
      if (!validationResult.valid) {
        return false;
      }

      setCurrentStep(currentStep + 1);

      // Log step completion
      logSystemEvent("system", "info", {
        description: `Onboarding step completed: ${steps[currentStep].id}, moving to ${steps[currentStep + 1].id}`,
        step: steps[currentStep].id,
        next_step: steps[currentStep + 1].id,
        context: "onboarding",
      }).catch((err) => console.error("Failed to log step:", err));

      return true;
    }
    return false;
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Navigate to specific step
  const handleStepClick = (step: number) => {
    // Only allow clicking on steps that have been completed or the next available step
    if (step <= currentStep || step === currentStep + 1) {
      setCurrentStep(step);
    }
  };

  return {
    steps,
    currentStep,
    step: steps[currentStep],
    handleNextStep,
    handlePrevStep,
    handleStepClick,
  };
}
