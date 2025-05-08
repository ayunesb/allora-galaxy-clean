
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { notifyAndLog } from '@/lib/notifications/notifyAndLog';

interface GenerateStrategyParams {
  tenantId: string;
  goals: string[];
  industry: string;
  companyName: string;
  companySize: string;
  description: string;
  onSuccess?: (strategy: any) => void;
  onError?: (error: Error) => void;
}

export const useStrategyGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const generateStrategy = async ({
    tenantId,
    goals,
    industry,
    companyName,
    companySize,
    description,
    onSuccess,
    onError
  }: GenerateStrategyParams) => {
    if (!tenantId || !user) {
      const error = new Error('Missing tenant ID or user');
      setError(error);
      onError?.(error);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call the edge function to generate a strategy
      const { data, error: functionError } = await supabase.functions.invoke('generateStrategy', {
        body: {
          goals,
          industry,
          company_name: companyName,
          company_size: companySize,
          description,
          tenant_id: tenantId,
          user_id: user.id
        }
      });

      if (functionError || !data) {
        throw new Error(functionError || 'Failed to generate strategy');
      }

      // Create the strategy in the database
      const { data: strategyData, error: strategyError } = await supabase
        .from('strategies')
        .insert({
          tenant_id: tenantId,
          title: data.title,
          description: data.description,
          status: 'pending',
          created_by: user.id,
          tags: data.tags || [],
          priority: data.priority || 'medium'
        })
        .select()
        .single();

      if (strategyError) {
        throw strategyError;
      }

      // Send a notification
      await notifyAndLog({
        tenant_id: tenantId,
        user_id: user.id,
        title: 'Strategy Generated',
        description: `A new strategy "${data.title}" has been generated and is ready for review.`,
        type: 'info',
        action_url: `/strategies/${strategyData.id}`,
        action_label: 'View Strategy',
        module: 'strategy_generation'
      });

      onSuccess?.(strategyData);
      return strategyData;
    } catch (err) {
      console.error('Error generating strategy:', err);
      setError(err as Error);
      onError?.(err as Error);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateStrategy,
    isGenerating,
    error
  };
};
