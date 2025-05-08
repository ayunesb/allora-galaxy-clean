import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OnboardingFormData } from '@/types/onboarding';
import { useOnboardingForm } from './useOnboardingForm';
import { useOnboardingSteps } from './useOnboardingSteps';
import { useOnboardingTenants } from './useOnboardingTenants';
import { useOnboardingSubmission } from './useOnboardingSubmission';
import { useStrategyGeneration } from './useStrategyGeneration';

export function useOnboardingWizard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { isGenerating, generateStrategy } = useStrategyGeneration();
  const { formData, updateFormData, setFieldValue, validateStep } = useOnboardingForm();
  const { tenantsList, hasTenants } = useOnboardingTenants(currentUser);
  
  // Validate current step
  const validateCurrentStep = () => {
    const stepId = steps[currentStep].id;
    const validation = validateStep(stepId);
    
    if (!validation.valid) {
      // Show validation errors
      toast({
        title: "Validation Error",
        description: Object.values(validation.errors).join(', '),
        variant: "destructive"
      });
    }
    
    return validation;
  };
  
  // Initialize steps management
  const {
    steps,
    currentStep,
    step,
    handleNextStep,
    handlePrevStep,
    handleStepClick
  } = useOnboardingSteps(validateCurrentStep);
  
  // Initialize submission handling
  const {
    isSubmitting,
    error,
    handleSubmit: submitForm,
    resetError
  } = useOnboardingSubmission(generateStrategy);
  
  // Check if current step is valid
  const isStepValid = () => {
    return validateStep(steps[currentStep].id).valid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // For the final step, we need to generate a strategy
    if (currentStep === steps.length - 1) {
      const success = await submitForm(formData);
      if (success) {
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } else {
      // Otherwise, move to the next step
      handleNextStep();
    }
  };

  return {
    step,
    currentStep,
    formData,
    steps,
    error,
    isSubmitting,
    tenantsList,
    currentUser,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    handleSubmit,
    isStepValid,
    resetError,
    validateCurrentStep,
    setFieldValue,
    isGeneratingStrategy: isGenerating,
    hasTenants
  };
}
