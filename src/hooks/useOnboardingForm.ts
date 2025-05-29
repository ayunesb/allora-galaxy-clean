import { useState } from "react";
import { OnboardingFormData, OnboardingStep } from "@/types/onboarding";
import { validateOnboardingData } from "@/lib/onboarding/validateOnboardingData";

/**
 * Hook to manage onboarding form state and validation
 */
export function useOnboardingForm() {
  // Form data state
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    industry: "",
    companySize: "",
    revenueRange: "",
    website: "",
    description: "",
    goals: [] as string[],
    companyInfo: {
      name: "",
      industry: "",
      size: "",
    },
    persona: {
      name: "",
      goals: [] as string[],
      tone: "",
    },
    additionalInfo: {
      targetAudience: "",
      keyCompetitors: "",
      uniqueSellingPoints: "",
    },
  });

  // Update form data - support both direct updates and section updates
  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => {
      // Handle the case where a single key-value pair is passed to update nested fields
      if (data && typeof data === "object" && Object.keys(data).length === 1) {
        const key = Object.keys(data)[0];
        const value = data[key];

        // Handle nested keys like 'persona.name'
        if (key.includes(".")) {
          const [section, field] = key.split(".");

          return {
            ...prev,
            [section]: {
              ...(prev[section as keyof OnboardingFormData] as Record<
                string,
                any
              >),
              [field]: value,
            },
          };
        }
      }

      // Standard merge for direct updates
      return { ...prev, ...data };
    });
  };

  // Set a specific field value
  const setFieldValue = (key: string, value: any) => {
    updateFormData({ [key]: value });
  };

  // Validate specific step
  const validateStep = (step: OnboardingStep) => {
    return validateOnboardingData(formData, step);
  };

  return {
    formData,
    updateFormData,
    setFieldValue,
    validateStep,
  };
}
