
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notifications/toast';
import { handleEdgeError, createEdgeFunction } from '@/lib/errors/clientErrorHandler';

export interface WebhookAlertConfig {
  webhook_url: string;
  alert_type: string;
  message: string;
  tenant_id: string;
  metadata?: Record<string, any>;
}

export interface WebhookResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Send a webhook alert
 * @param config Alert configuration
 * @returns Result of the webhook operation
 */
export const sendWebhookAlert = async (config: WebhookAlertConfig): Promise<WebhookResult> => {
  try {
    // Validate required fields
    if (!config.webhook_url || !config.alert_type || !config.message || !config.tenant_id) {
      throw new Error('Missing required webhook alert configuration fields');
    }

    // Call the webhook alert function
    const { data, error } = await supabase.functions.invoke('send-webhook-alert', {
      body: config
    });

    if (error) {
      throw error;
    }

    notify({
      title: 'Webhook alert sent successfully',
      description: `Alert "${config.alert_type}" was sent to the webhook`,
    });

    return { success: true, data };
  } catch (error) {
    // Use the centralized error handling system
    handleEdgeError(error, {
      showToast: true,
      fallbackMessage: 'Failed to send webhook alert',
      logToConsole: true,
    });

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Retry sending a webhook alert with configurable retry attempts
 */
export const retryWebhookAlert = async (
  config: WebhookAlertConfig,
  retryOptions = { maxAttempts: 3, delayMs: 1000 }
): Promise<WebhookResult> => {
  let attempts = 0;
  let result: WebhookResult;

  do {
    if (attempts > 0) {
      console.log(`Retry attempt ${attempts} for webhook alert...`);
      await new Promise(resolve => setTimeout(resolve, retryOptions.delayMs));
    }
    
    result = await sendWebhookAlert(config);
    attempts++;
    
  } while (!result.success && attempts < retryOptions.maxAttempts);

  if (!result.success && attempts >= retryOptions.maxAttempts) {
    notify({
      title: 'Webhook alert failed',
      description: `Failed to send alert after ${attempts} attempts`,
      variant: 'destructive'
    });
  }

  return result;
};

/**
 * Wrapped version of sendWebhookAlert with built-in error handling
 * Can be used directly in components without try/catch blocks
 */
export const sendWebhookAlertWithErrorHandling = createEdgeFunction(
  sendWebhookAlert,
  {
    fallbackMessage: 'Failed to send webhook alert',
    showToast: true
  }
);
