
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ApiKey, ApiKeyCreateParams, ApiKeyResponse } from '@/types/api-key';
import { useTenantId } from '@/hooks/useTenantId';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { tenantId } = useTenantId();

  useEffect(() => {
    fetchApiKeys();
  }, [tenantId]);

  const fetchApiKeys = async () => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setApiKeys(data || []);
    } catch (err: any) {
      console.error('Error fetching API keys:', err);
      setError(err.message || 'Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (params: ApiKeyCreateParams): Promise<ApiKeyResponse | null> => {
    if (!tenantId) {
      toast({
        title: "Error",
        description: "No tenant selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('create_api_key', {
        p_name: params.name,
        p_tenant_id: tenantId,
        p_scope: params.scope,
        p_expires_at: params.expires_at || null
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "API Key created",
        description: "New API key has been successfully created",
      });
      
      // Refresh the list
      fetchApiKeys();
      
      return data;
    } catch (err: any) {
      console.error('Error creating API key:', err);
      toast({
        title: "Failed to create API Key",
        description: err.message || "An error occurred while creating the API key",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteApiKey = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
      return true;
    } catch (err: any) {
      console.error('Error deleting API key:', err);
      throw err;
    }
  };

  const revokeApiKey = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ status: 'revoked' })
        .eq('id', id)
        .eq('tenant_id', tenantId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, status: 'revoked' } : key
      ));
      
      return true;
    } catch (err: any) {
      console.error('Error revoking API key:', err);
      throw err;
    }
  };

  return {
    apiKeys,
    isLoading,
    error,
    fetchApiKeys,
    createApiKey,
    deleteApiKey,
    revokeApiKey
  };
}
