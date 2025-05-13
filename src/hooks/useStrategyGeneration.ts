
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStrategyGeneration as useStrategyGenerationMutation } from '@/services/onboardingService';

export const useStrategyGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const strategyGenerationMutation = useStrategyGenerationMutation();
  
  const generateStrategies = async (tenantId: string, goals: string[], industry: string) => {
    setIsGenerating(true);
    
    try {
      const result = await strategyGenerationMutation.mutateAsync({ tenantId, goals, industry });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Show success toast
      toast({
        title: 'Strategies Generated',
        description: 'Initial strategies have been created for your workspace.',
      });
      
      return result.tenantId;
    } catch (error: any) {
      console.error('Strategy generation error:', error);
      toast({
        title: 'Strategy Generation Failed',
        description: error.message || 'There was an error generating strategies.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    generateStrategies,
    isGenerating: isGenerating || strategyGenerationMutation.isPending,
    error: strategyGenerationMutation.error
  };
};

export default useStrategyGeneration;
