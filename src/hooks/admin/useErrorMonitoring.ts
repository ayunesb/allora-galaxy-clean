
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ErrorAlertConfig {
  threshold: number;
  timeframe: number; // in minutes
  recipients: string[];
  notification_type: 'email' | 'webhook' | 'in_app';
  webhook_url?: string;
  severity: 'critical' | 'warning';
}

export function useErrorMonitoring(tenantId?: string) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  
  const checkErrorThreshold = async (config: ErrorAlertConfig) => {
    if (!tenantId) {
      toast("Error", {
        description: "No tenant ID provided"
      });
      return null;
    }
    
    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('error-monitoring', {
        body: {
          tenant_id: tenantId,
          alert_config: config
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      toast("Failed to check error threshold", {
        description: error.message || "An unknown error occurred"
      });
      return null;
    } finally {
      setIsChecking(false);
    }
  };
  
  const configureAlerts = async (config: ErrorAlertConfig) => {
    if (!tenantId) {
      toast("Error", {
        description: "No tenant ID provided"
      });
      return false;
    }
    
    try {
      // In a real implementation, you would save this configuration
      // to a dedicated table in the database
      const { error } = await supabase
        .from('system_logs')
        .insert({
          module: 'error_monitoring',
          event: 'configure_alerts',
          tenant_id: tenantId,
          context: { alert_config: config }
        });
      
      if (error) throw error;
      
      toast("Alert configuration saved", {
        description: "Error monitoring alerts have been configured"
      });
      
      return true;
    } catch (error: any) {
      toast("Failed to save alert configuration", {
        description: error.message || "An unknown error occurred"
      });
      return false;
    }
  };
  
  return {
    checkErrorThreshold,
    configureAlerts,
    isChecking
  };
}

export default useErrorMonitoring;
