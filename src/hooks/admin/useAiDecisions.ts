
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LogFilters, SystemLog } from '@/types/logs';
import { useTenantId } from '@/hooks/useTenantId';

interface AIDecision extends SystemLog {
  decision: string;
  confidence: number;
  model: string;
  reasoning?: string;
}

export const useAiDecisions = () => {
  const { id: tenantId } = useTenantId();
  
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Partial<LogFilters>>({
    module: 'ai-decision-maker',
    startDate: undefined,
    endDate: undefined,
    search: '',
  });

  useEffect(() => {
    if (tenantId) {
      fetchDecisions();
    }
  }, [filters, tenantId]);

  const fetchDecisions = async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('module', 'ai-decision-maker')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      // Use consistent naming between fromDate/startDate and toDate/endDate
      const fromDate = filters.fromDate || filters.startDate;
      const toDate = filters.toDate || filters.endDate;
      
      if (fromDate) {
        query = query.gte('created_at', fromDate);
      }
      
      if (toDate) {
        query = query.lte('created_at', toDate);
      }
      
      // Use consistent naming between search and searchTerm
      const searchTerm = filters.searchTerm || filters.search;
      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,context.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to AIDecision format
      const aiDecisions: AIDecision[] = (data || []).map(log => {
        const metadata = log.metadata || {};
        return {
          ...log,
          timestamp: log.created_at,
          decision: metadata.decision || 'Unknown',
          confidence: metadata.confidence || 0,
          model: metadata.model || 'Unknown',
          reasoning: metadata.reasoning,
          level: log.level || 'info',
          event_type: log.event_type || 'info',
        };
      });
      
      setDecisions(aiDecisions);
    } catch (err) {
      console.error('Error fetching AI decisions:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    decisions,
    isLoading,
    filters,
    setFilters,
    updateFilters: setFilters,
    refetch: fetchDecisions,
  };
};

export default useAiDecisions;
