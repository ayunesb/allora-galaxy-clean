
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface WebhookConfig {
  url: string;
  event: string;
  headers?: Record<string, string>;
  secret?: string;
}

export const useWebhookAlerts = () => {
  const [loading, setLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);

  const sendWebhookAlert = async (
    url: string,
    event: string,
    data: any,
    headers?: Record<string, string>
  ) => {
    if (!url || !event || !data) {
      toast({
        title: "Missing Information",
        description: "All required fields must be provided",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // In a real implementation, this would call an Edge Function
      // For demo purposes, we'll just simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success
      const newWebhook: WebhookConfig = {
        url,
        event,
        headers
      };

      // Update state
      setWebhooks(prev => [...prev, newWebhook]);

      toast({
        title: "Webhook Alert Sent",
        description: "The webhook alert was sent successfully",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error sending webhook alert:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to send webhook alert',
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getWebhookHistory = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from Supabase
      // For demo purposes, we'll return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockWebhooks: WebhookConfig[] = [
        {
          url: 'https://api.example.com/webhook',
          event: 'strategy.executed',
          headers: { 'X-Custom-Header': 'value' }
        },
        {
          url: 'https://hooks.slack.com/services/xxx',
          event: 'error.critical',
        },
        {
          url: 'https://webhook.site/test',
          event: 'agent.evolved',
          headers: { 'Authentication': 'Bearer ***' }
        }
      ];
      
      setWebhooks(mockWebhooks);
      return mockWebhooks;
    } catch (error: any) {
      console.error('Error fetching webhook history:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch webhook history',
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    webhooks,
    sendWebhookAlert,
    getWebhookHistory
  };
};

export default useWebhookAlerts;
