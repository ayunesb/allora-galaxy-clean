
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notifications/toast';
import type { SystemLog, LogFilters } from '@/types/logs';

// Define filter interface specifically for AI decisions
interface AiDecisionFilters extends Partial<LogFilters> {
  startDate?: string;
  endDate?: string;
  confidence_threshold?: number;
  decision_type?: string;
  source?: string;
}

export function useAiDecisions(initialFilters: AiDecisionFilters = {}) {
  const [decisions, setDecisions] = useState<SystemLog[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<AiDecisionFilters>({
    module: 'ai',
    startDate: undefined,
    endDate: undefined,
    confidence_threshold: undefined,
    decision_type: undefined,
    source: undefined,
    ...initialFilters
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const fetchDecisions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('ai_decisions')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.decision_type) {
        query = query.eq('decision_type', filters.decision_type);
      }
      
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      
      if (filters.confidence_threshold) {
        query = query.gte('confidence', filters.confidence_threshold);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      const { data, count: totalCount, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching AI decisions: ${error.message}`);
      }
      
      setDecisions(data as SystemLog[]);
      setCount(totalCount || 0);
    } catch (error) {
      console.error('Error in useAiDecisions:', error);
      notify({ 
        title: 'Error loading AI decisions',
        description: error instanceof Error ? error.message : 'Unknown error'
      }, { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  const updateFilters = useCallback((newFilters: Partial<AiDecisionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      module: 'ai'
    });
    setPage(1);
  }, []);

  return {
    decisions,
    count,
    isLoading,
    filters,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchDecisions,
    updateFilters,
    clearFilters
  };
}
