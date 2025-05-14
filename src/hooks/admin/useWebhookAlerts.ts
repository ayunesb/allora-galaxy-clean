
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifySuccess, notifyError } from '@/components/ui/BetterToast';

export interface WebhookAlertConfig {
  webhook_url: string;
  alert_type: string;
  message: string;
  tenant_id: string;
  metadata?: Record<string, any>;
}

export const useWebhookAlerts = () => {
  const [loading, setLoading] = useState(false);

  const sendWebhookAlert = async (config: WebhookAlertConfig) => {
    if (!config.webhook_url || !config.alert_type || !config.message || !config.tenant_id) {
      notifyError({
        title: 'Invalid webhook configuration',
        description: 'All required fields must be provided'
      });
      return { success: false, error: 'Invalid webhook configuration' };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .functions
        .invoke('send-webhook-alert', {
          body: config
        });

      if (error) {
        notifyError({
          title: 'Webhook Error',
          description: error.message
        });
        return { success: false, error: error.message };
      }

      notifySuccess({
        title: 'Webhook Sent',
        description: 'The webhook alert was sent successfully'
      });
      return { success: true, data };
    } catch (err: any) {
      notifyError({
        title: 'Webhook Error',
        description: err.message || 'Failed to send webhook'
      });
      return { success: false, error: err.message || 'Failed to send webhook' };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendWebhookAlert,
    loading
  };
};

export default useWebhookAlerts;
