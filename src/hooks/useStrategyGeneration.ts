
import { useState } from 'react';
import { OnboardingFormData } from '@/types/onboarding';
import { completeOnboarding } from '@/services/onboardingService';
import { useAuth } from '@/context/AuthContext';

interface StrategyGenerationResult {
  success: boolean;
  error?: string;
  tenantId?: string;
  strategyId?: string;
}

export const useStrategyGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  
  /**
   * Generate an initial strategy based on onboarding data
   */
  const generateStrategy = async (formData: OnboardingFormData): Promise<StrategyGenerationResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsGenerating(true);
    
    try {
      const result = await completeOnboarding(user.id, formData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete onboarding');
      }
      
      // Return the result with strategyId if available
      return {
        success: true,
        tenantId: result.tenantId,
        strategyId: result.strategyId
      };
    } catch (error: any) {
      console.error('Strategy generation error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to generate strategy'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateStrategy
  };
};
