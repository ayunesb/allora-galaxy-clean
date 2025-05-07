
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { createNotification } from '@/services/notificationService';

/**
 * Hook for handling AI strategy generation
 */
export const useStrategyGeneration = () => {
  const { toast } = useToast();
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  /**
   * Generate AI strategy based on company and persona data
   */
  const generateAIStrategy = async (tenantId: string, userId: string, formData: any) => {
    setIsGeneratingStrategy(true);
    try {
      // Prepare data for the AI
      const companyProfile = {
        name: formData.companyName,
        industry: formData.industry,
        size: formData.teamSize,
        revenue_range: formData.revenueRange,
        website: formData.website,
        description: formData.description
      };
      
      const personaProfile = {
        name: formData.personaName,
        tone: formData.tone,
        goals: formData.goals.split(',').map((goal: string) => goal.trim())
      };
      
      // Call the edge function to generate a strategy
      const { data, error } = await supabase.functions.invoke('generateStrategy', {
        body: {
          tenant_id: tenantId,
          company_profile: companyProfile,
          persona_profile: personaProfile,
          user_id: userId
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate strategy');
      }
      
      toast({
        title: 'Strategy generated!',
        description: 'Your AI-powered strategy is ready to review.',
      });

      // Create notification about the new strategy
      await createNotification({
        tenant_id: tenantId,
        user_id: userId,
        title: 'New AI Strategy Ready',
        message: 'Your first AI-generated strategy has been created and is ready for review.',
        type: 'info',
        action_url: '/strategies',
        action_label: 'View Strategy'
      });
      
      // Log successful generation
      await logSystemEvent(
        tenantId,
        'strategy',
        'strategy_generated_onboarding',
        { strategy_id: data?.strategy?.id }
      );
      
      return data?.strategy;
    } catch (error: any) {
      console.error('Strategy generation error:', error);
      toast({
        title: 'Strategy generation failed',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  return {
    generateAIStrategy,
    isGeneratingStrategy
  };
};
