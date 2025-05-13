
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import type { Plugin } from '@/types/plugin';

export interface UsePluginsProps {
  category?: string;
  status?: string;
  limit?: number;
  withXp?: boolean;
}

export function usePlugins(props?: UsePluginsProps) {
  const { category, status, limit, withXp } = props || {};
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { tenantId } = useTenantId();

  const categories = [
    'analytics',
    'communication',
    'content',
    'crm',
    'integration',
    'marketing',
    'utility',
    'social'
  ];

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('plugins')
        .select('*');

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      if (category) {
        query = query.eq('category', category);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (withXp) {
        query = query.order('xp', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setPlugins(data || []);
    } catch (err: any) {
      console.error('Error fetching plugins:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, [tenantId, category, status, limit, withXp]);

  return {
    plugins,
    loading,
    error,
    fetchPlugins,
    categories
  };
}
