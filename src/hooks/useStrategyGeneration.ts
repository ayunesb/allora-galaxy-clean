
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Mock service function until actual service is implemented
const generateStrategiesService = async ({ tenantId, goals, industry }: { 
  tenantId: string; 
  goals: string[]; 
  industry: string; 
}) => {
  // This would typically call a service function instead
  try {
    const { data, error } = await supabase.functions.invoke('generateStrategy', {
      body: {
        tenant_id: tenantId,
        goals,
        industry
      }
    });
    
    if (error) throw error;
    
    return { 
      success: true, 
      tenantId, 
      data 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to generate strategies' 
    };
  }
};

export const useStrategyGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const strategyGenerationMutation = useMutation({
    mutationFn: generateStrategiesService,
    onError: (error: any) => {
      console.error('Strategy generation error:', error);
      toast({
        title: 'Strategy Generation Error',
        description: error.message || 'Failed to generate strategies',
        variant: 'destructive',
      });
      return false;
    }
  });
  
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
