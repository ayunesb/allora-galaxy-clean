
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OnboardingStep, OnboardingFormData } from '@/types/onboarding';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { validateOnboardingData } from '@/lib/onboarding/validateOnboardingData';
import { useStrategyGeneration } from './useStrategyGeneration';
import { sendNotification } from '@/lib/notifications/sendNotification';

export function useOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isGenerating: isGeneratingStrategy, generateStrategy } = useStrategyGeneration();
  
  // Initial form data - ensure it matches OnboardingFormData interface
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    revenueRange: '',
    description: '', // Required field
    goals: [] as string[],
    persona: { 
      name: '',
      goals: [] as string[],
      tone: ''
    },
    additionalInfo: ''
  });

  // Define steps
  const steps = [
    { id: 'company-info' as OnboardingStep, label: 'Company Info' },
    { id: 'persona' as OnboardingStep, label: 'Target Persona' },
    { id: 'additional-info' as OnboardingStep, label: 'Additional Info' },
    { id: 'strategy-generation' as OnboardingStep, label: 'Strategy' },
  ];

  // Check if user already has tenants
  useEffect(() => {
    if (currentUser?.id) {
      checkExistingTenants();
    }
  }, [currentUser]);

  // Check if user already has tenants
  const checkExistingTenants = async () => {
    try {
      if (!currentUser?.id) return;
      
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id')
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('Error checking tenants:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setTenantsList(data);
      }
    } catch (err) {
      console.error('Error checking tenants:', err);
    }
  };

  // Update form data
  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Set a specific field value
  const setFieldValue = (key: string, value: any) => {
    // Handle nested fields like persona.name
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      updateFormData({
        [parent]: {
          ...formData[parent as keyof OnboardingFormData],
          [child]: value
        }
      });
    } else {
      updateFormData({ [key as keyof OnboardingFormData]: value });
    }
  };

  // Navigate to next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      // Validate current step before proceeding
      const validationResult = validateCurrentStep();
      if (!validationResult.valid) {
        // Show validation errors
        toast({
          title: "Validation Error",
          description: Object.values(validationResult.errors).join(', '),
          variant: "destructive"
        });
        return;
      }
      
      setCurrentStep(currentStep + 1);
      
      // Log step completion
      logSystemEvent('system', 'onboarding', 'step_completed', {
        step: steps[currentStep].id,
        next_step: steps[currentStep + 1].id
      });
    }
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

  // Validate current step
  const validateCurrentStep = () => {
    const stepId = steps[currentStep].id;
    return validateOnboardingData(formData, stepId);
  };

  // Check if current step is valid
  const isStepValid = () => {
    return validateCurrentStep().valid;
  };

  // Reset error
  const resetError = () => {
    setError(null);
  };

  // Submit form
  const handleSubmit = async () => {
    // For the final step, we need to generate a strategy
    if (currentStep === steps.length - 1) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        // Generate strategy
        const result = await generateStrategy(formData);
        
        if (result.success) {
          // Send notification
          await sendNotification({
            title: 'Welcome to Allora OS',
            description: 'Your workspace is ready! We\'ve created your initial strategy.',
            type: 'success',
            tenant_id: result.tenantId || '',
            user_id: currentUser?.id || '',
            action_label: 'View Dashboard',
            action_url: '/dashboard'
          });
          
          toast({
            title: 'Welcome to Allora OS!',
            description: 'Your workspace has been created successfully.',
          });
          
          // Navigate to dashboard
          navigate('/dashboard');
        } else {
          setError(result.error || 'Failed to create workspace');
          toast({
            title: 'Error',
            description: result.error || 'Failed to create workspace',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
        toast({
          title: 'Error',
          description: err.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
        console.error('Onboarding error:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Otherwise, move to the next step
      handleNextStep();
    }
  };

  return {
    step: steps[currentStep],
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
    isGeneratingStrategy
  };
}
