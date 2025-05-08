
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useWorkspace } from '@/context/WorkspaceContext';
import { sendNotification } from '@/lib/notifications/sendNotification';
import { notifySuccess, notifyError } from '@/components/ui/BetterToast';
import { Strategy } from '@/types';

export const useStrategyGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentTenant } = useWorkspace();
  const { user } = useAuth();

  const generateStrategy = async (
    title: string,
    description: string,
    goals: string[]
  ): Promise<{ success: boolean; strategy?: Strategy; error?: Error }> => {
    if (!currentTenant || !user) {
      notifyError('Error', 'No active workspace or user session');
      return { success: false, error: new Error('No active workspace or user session') };
    }

    setIsGenerating(true);

    try {
      const strategyId = uuidv4();
      
      // Create strategy record
      const { data: strategy, error: createError } = await supabase
        .from('strategies')
        .insert({
          id: strategyId,
          title,
          description,
          tags: goals,
          status: 'pending',
          tenant_id: currentTenant.id,
          created_by: user.id,
          completion_percentage: 0,
          priority: 'medium'
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Send notification about the new strategy
      await sendNotification({
        tenant_id: currentTenant.id,
        user_id: user.id,
        title: 'Strategy Created',
        description: `Your strategy "${title}" has been created and is ready for review.`,
        type: 'info',
        action_url: `/strategies/${strategyId}`,
        action_label: 'View Strategy'
      });

      notifySuccess('Strategy Created', 'Your strategy has been created successfully');
      
      return { success: true, strategy };
    } catch (error: any) {
      console.error('Strategy generation error:', error);
      notifyError('Strategy Creation Failed', error.message);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateStrategy
  };
};
