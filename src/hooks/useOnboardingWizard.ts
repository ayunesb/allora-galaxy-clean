import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOnboardingForm } from './useOnboardingForm';
import { useOnboardingSteps } from './useOnboardingSteps';
import { useOnboardingTenants } from './useOnboardingTenants';
import { useOnboardingSubmission } from './useOnboardingSubmission';

/**
 * Main hook for managing the onboarding wizard
 */
export function useOnboardingWizard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { formData, updateFormData, setFieldValue, validateStep } = useOnboardingForm();
  const { tenantsList, hasTenants } = useOnboardingTenants(currentUser);
  const { isSubmitting, error, handleSubmit: submitForm, resetError } = useOnboardingSubmission();
  
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

  // Return all necessary values and functions
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
    isGeneratingStrategy: isSubmitting,
    hasTenants
  };
}
