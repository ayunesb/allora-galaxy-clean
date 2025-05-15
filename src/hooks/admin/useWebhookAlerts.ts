import { useState } from 'react';
// Remove the unused toast import
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebhookAlert {
  id: string;
  created_at: string;
  tenant_id: string;
  webhook_url: string;
  alert_type: string;
  is_active: boolean;
  headers: { [key: string]: string } | null;
  payload: { [key: string]: any } | null;
}

interface UseWebhookAlertsResult {
  alerts: WebhookAlert[] | null;
  loading: boolean;
  error: string | null;
  createAlert: (alert: Omit<WebhookAlert, 'id' | 'created_at'>) => Promise<void>;
  updateAlert: (alert: WebhookAlert) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
}

export const useWebhookAlerts = (tenantId: string): UseWebhookAlertsResult => {
  const [alerts, setAlerts] = useState<WebhookAlert[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('webhook_alerts')
        .select('*')
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(error.message);
      }

      setAlerts(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        description: `Failed to fetch alerts: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts on component mount
  useState(() => {
    if (tenantId) {
      fetchAlerts();
    }
  }, [tenantId]);

  const createAlert = async (alert: Omit<WebhookAlert, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('webhook_alerts')
        .insert([{ ...alert }])
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      setAlerts(prevAlerts => [...(prevAlerts || []), data[0]]);
      toast({
        description: 'Alert created successfully',
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        description: `Failed to create alert: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (alert: WebhookAlert) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('webhook_alerts')
        .update({ ...alert })
        .eq('id', alert.id)
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      setAlerts(prevAlerts =>
        (prevAlerts || []).map(existingAlert =>
          existingAlert.id === alert.id ? data[0] : existingAlert
        )
      );
      toast({
        description: 'Alert updated successfully',
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        description: `Failed to update alert: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('webhook_alerts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setAlerts(prevAlerts => (prevAlerts || []).filter(alert => alert.id !== id));
      toast({
        description: 'Alert deleted successfully',
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        description: `Failed to delete alert: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('webhook_alerts')
        .update({ is_active: isActive })
        .eq('id', id)
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      setAlerts(prevAlerts =>
        (prevAlerts || []).map(existingAlert =>
          existingAlert.id === id ? data[0] : existingAlert
        )
      );
      toast({
        description: `Alert ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        description: `Failed to toggle alert: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleActive,
  };
};
