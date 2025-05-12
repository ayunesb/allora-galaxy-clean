
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog, LogFilters } from '@/types/logs';
import { useTenantId } from '@/hooks/useTenantId';
import { formatDate } from '@/lib/utils/date';

export const useAiDecisionsData = () => {
  const [decisions, setDecisions] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    module: null,
    event: null,
    fromDate: null,
    toDate: null,
    searchTerm: '',
    limit: 100
  });
  const { tenantId } = useTenantId();
  
  const fetchDecisions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .or('module.eq.agent,module.eq.strategy,event.eq.execute');
      
      // Apply tenant filter if applicable
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      if (filters.fromDate) {
        const formattedFromDate = formatDate(filters.fromDate.toISOString(), 'yyyy-MM-dd');
        query = query.gte('created_at', `${formattedFromDate}T00:00:00`);
      }
      
      if (filters.toDate) {
        const formattedToDate = formatDate(filters.toDate.toISOString(), 'yyyy-MM-dd');
        query = query.lte('created_at', `${formattedToDate}T23:59:59`);
      }
      
      if (filters.searchTerm) {
        // Use ilike for case-insensitive search
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`);
      }
      
      // Order by created_at DESC
      query = query.order('created_at', { ascending: false });
      
      // Limit to 100 records or user specified limit
      query = query.limit(filters.limit || 100);
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setDecisions(data || []);
    } catch (err: any) {
      console.error('Error fetching AI decisions:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, filters]);
  
  // Fetch decisions on mount and when filters change
  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);
  
  return {
    decisions,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchDecisions
  };
};
