
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface SendWebhookAlertParams {
  webhook_url: string;
  alert_type: string;
  message: string;
  metadata?: Record<string, any>;
}

export function useWebhookAlert() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();

  const sendWebhookAlert = async ({
    webhook_url,
    alert_type,
    message,
    metadata = {}
  }: SendWebhookAlertParams) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'No active workspace found',
        variant: 'destructive'
      });
      return { success: false };
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-webhook-alert', {
        body: {
          webhook_url,
          alert_type,
          message,
          tenant_id: currentWorkspace.id,
          metadata
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Webhook Alert Sent',
        description: 'The webhook alert was sent successfully',
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending webhook alert:', error);
      
      toast({
        title: 'Webhook Alert Failed',
        description: error.message || 'Failed to send webhook alert',
        variant: 'destructive'
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendWebhookAlert,
    isLoading
  };
}
