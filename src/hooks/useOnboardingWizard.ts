
import { useWorkspace } from '@/context/WorkspaceContext';
import { useOnboardingSteps } from '@/hooks/useOnboardingSteps';
import { useOnboardingForm } from '@/hooks/useOnboardingForm';
import { useOnboardingSubmission } from '@/hooks/useOnboardingSubmission';
import { useOnboardingRedirect } from '@/hooks/useOnboardingRedirect';
import { useStrategyGeneration } from '@/hooks/useStrategyGeneration';
import { OnboardingFormData } from '@/types/onboarding';

export type { OnboardingFormData } from '@/types/onboarding';

/**
 * Custom hook for handling the onboarding wizard flow
 */
export const useOnboardingWizard = () => {
  const { tenants, currentTenant, setCurrentTenant } = useWorkspace();
  const { formData, updateFormData } = useOnboardingForm();
  const { handleSubmit, isSubmitting, error, resetError, user } = useOnboardingSubmission();
  const { generateAIStrategy, isGeneratingStrategy } = useStrategyGeneration();
  
  // Use our dedicated steps hook
  const { 
    currentStep, 
    handleNextStep, 
    handlePrevStep, 
    handleStepClick, 
    isStepValid,
    validateCurrentStep 
  } = useOnboardingSteps(formData);
  
  // Handle redirect if already onboarded
  useOnboardingRedirect(tenants);
  
  // Submit handler that coordinates both submission and strategy generation
  const submitOnboarding = async () => {
    // First submit the onboarding data
    const tenantId = await handleSubmit(formData, setCurrentTenant, async (newTenantId) => {
      // Move to the strategy generation step
      handleStepClick(3);
      
      // Generate AI strategy on success
      if (user && newTenantId) {
        await generateAIStrategy(newTenantId, user.id, formData);
      }
    });
    
    return tenantId;
  };

  return {
    currentStep,
    isSubmitting,
    error,
    formData,
    tenants,
    user,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    handleSubmit: submitOnboarding,
    isStepValid,
    resetError,
    validateCurrentStep,
    isGeneratingStrategy
  };
};
