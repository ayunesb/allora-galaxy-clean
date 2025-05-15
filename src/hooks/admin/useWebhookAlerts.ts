
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/lib/notifications/toast';

export interface WebhookAlertConfig {
  webhook_url: string;
  alert_type: string;
  message: string;
  tenant_id: string;
  metadata?: Record<string, any>;
}

export interface WebhookResponse {
  success: boolean;
  error?: string;
  data?: any;
  status?: number;
  timestamp?: string;
}

export const useWebhookAlerts = () => {
  const [loading, setLoading] = useState(false);
  const { toast, success: notifySuccess, error: notifyError, warning: notifyWarning } = useToast();

  const validateConfig = (config: WebhookAlertConfig): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!config.webhook_url) errors.push('Webhook URL is required');
    if (!config.alert_type) errors.push('Alert type is required');
    if (!config.message) errors.push('Message is required');
    if (!config.tenant_id) errors.push('Tenant ID is required');
    
    // Validate URL format
    if (config.webhook_url && !config.webhook_url.match(/^https?:\/\/.+/)) {
      errors.push('Invalid webhook URL format');
    }
    
    return { 
      valid: errors.length === 0,
      errors
    };
  };

  const sendWebhookAlert = useCallback(async (config: WebhookAlertConfig): Promise<WebhookResponse> => {
    const validation = validateConfig(config);
    
    if (!validation.valid) {
      notifyError("Invalid webhook configuration", {
        description: validation.errors.join(', ')
      });
      
      return { 
        success: false, 
        error: validation.errors.join(', ')
      };
    }

    try {
      setLoading(true);
      
      // Add timestamp metadata
      const configWithTimestamp = {
        ...config,
        metadata: {
          ...config.metadata,
          sent_at: new Date().toISOString()
        }
      };
      
      const { data, error } = await supabase
        .functions
        .invoke('send-webhook-alert', {
          body: configWithTimestamp
        });

      if (error) {
        console.error('Webhook error:', error);
        notifyError("Webhook Error", {
          description: error.message || 'Failed to send webhook'
        });
        
        return { 
          success: false, 
          error: error.message,
          status: error.status || 500,
          timestamp: new Date().toISOString()
        };
      }

      // Log successful webhook
      console.log('Webhook sent successfully:', data);
      notifySuccess("Webhook Sent", {
        description: "The webhook alert was sent successfully"
      });
      
      return { 
        success: true, 
        data,
        status: 200,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      console.error('Webhook error:', err);
      notifyError("Webhook Error", {
        description: err.message || "Failed to send webhook"
      });
      
      return { 
        success: false, 
        error: err.message || 'Failed to send webhook',
        status: err.status || 500,
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, [notifySuccess, notifyError]);

  const sendBatchWebhookAlerts = useCallback(async (configs: WebhookAlertConfig[]): Promise<WebhookResponse[]> => {
    const results: WebhookResponse[] = [];
    
    for (const config of configs) {
      const result = await sendWebhookAlert(config);
      results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      notifySuccess("All Webhooks Sent", {
        description: `Successfully sent ${successCount} webhook alerts`
      });
    } else {
      notifyWarning("Webhook Batch Completed", {
        description: `Sent ${successCount}/${totalCount} webhook alerts successfully`
      });
    }
    
    return results;
  }, [sendWebhookAlert, notifySuccess, notifyWarning]);

  return {
    sendWebhookAlert,
    sendBatchWebhookAlerts,
    loading,
    validateConfig
  };
};

export default useWebhookAlerts;
