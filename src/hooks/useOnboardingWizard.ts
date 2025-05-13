
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingData } from '@/types/onboarding/types';
import { useStrategyGeneration } from './useStrategyGeneration';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useOnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<OnboardingData>({
    companyName: '',
    industry: '',
    companySize: '',
    goals: [],
    persona: '',
    tonePreference: '',
    targeting: [],
    aggressiveness: 'moderate',
  });
  
  const [isGeneratingComplete, setIsGeneratingComplete] = useState(false);
  const { generateStrategies, isGenerating, error } = useStrategyGeneration();

  // Function to go to next step
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  }, []);

  // Function to go to previous step
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // Function to update form data
  const updateFormData = useCallback((data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Generate strategy when reaching the strategy step
  useEffect(() => {
    const generateStrategyOnStep = async () => {
      if (currentStep === 3 && !isGeneratingComplete) {
        try {
          // Get tenant ID for the current user
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('id')
            .eq('owner_id', supabase.auth.getUser())
            .limit(1);
            
          if (tenantError || !tenantData || tenantData.length === 0) {
            throw new Error('Could not find tenant for current user');
          }
          
          const tenantId = tenantData[0].id;
          
          // Generate strategies based on goals and industry
          const result = await generateStrategies(
            tenantId, 
            formData.goals,
            formData.industry
          );
          
          if (!result) {
            throw new Error('Strategy generation failed');
          }
          
          setIsGeneratingComplete(true);
          
        } catch (err: any) {
          console.error('Error generating strategy:', err);
          toast({
            title: 'Strategy Generation Error',
            description: err.message || 'Failed to generate strategy',
            variant: 'destructive',
          });
        }
      }
    };
    
    generateStrategyOnStep();
  }, [currentStep, formData.goals, formData.industry, isGeneratingComplete, generateStrategies]);

  // Function to complete onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      const userSession = await supabase.auth.getSession();
      if (!userSession.data.session) {
        throw new Error('User not authenticated');
      }
      
      const userId = userSession.data.session.user.id;
      
      // Mark onboarding as complete
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId);
        
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding',
        variant: 'destructive',
      });
    }
  }, [navigate]);

  return {
    currentStep,
    nextStep,
    prevStep,
    formData,
    updateFormData,
    isGenerating,
    isGeneratingComplete,
    error,
    completeOnboarding,
  };
};

export default useOnboardingWizard;
