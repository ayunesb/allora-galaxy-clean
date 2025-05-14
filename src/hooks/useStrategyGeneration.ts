
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { OnboardingFormData } from '@/types/onboarding/types';
import { completeOnboarding } from '@/services/onboardingService';

export function useStrategyGeneration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Generate a strategy based on the onboarding data
  const generateStrategy = async (formData: OnboardingFormData) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You need to be logged in to generate a strategy",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsGenerating(true);
    setProgress(10);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Complete onboarding which also creates an initial strategy
      const result = await completeOnboarding(user.id, formData);
      
      clearInterval(interval);
      setProgress(100);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate strategy");
      }

      // Success!
      toast({
        title: "Strategy generated!",
        description: "Your initial strategy has been created.",
      });

      // Navigate to the strategy page if we have IDs
      if (result.tenantId && result.strategyId) {
        navigate(`/strategies/${result.strategyId}?tenant=${result.tenantId}`);
      } else {
        navigate('/dashboard');
      }

      return { 
        success: true,
        tenantId: result.tenantId,
        strategyId: result.strategyId
      };
    } catch (error: any) {
      console.error("Strategy generation error:", error);
      
      toast({
        title: "Strategy generation failed",
        description: error.message || "There was an error generating your strategy",
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateStrategy,
    isGenerating,
    progress,
  };
}
