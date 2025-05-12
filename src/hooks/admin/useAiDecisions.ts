
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuditLog } from '@/types/logs';
import { SystemEventModule } from '@/types/shared';
import { DateRange } from '@/types/shared';
import { supabase } from '@/lib/supabase';

interface AIDecisionsFilters {
  searchTerm: string;
  dateRange?: DateRange;
  module?: SystemEventModule;
}

export function useAiDecisions() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AIDecisionsFilters>({
    searchTerm: '',
  });

  useEffect(() => {
    fetchAIDecisions();
  }, [filters]);

  const fetchAIDecisions = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('module', 'system')
        .eq('event', 'ai_decision')
        .order('created_at', { ascending: false });
        
      // Apply search filter if provided
      if (filters.searchTerm) {
        query = query.textSearch('context', filters.searchTerm);
      }
      
      // Apply date range filter if provided
      if (filters.dateRange?.from) {
        const fromDate = filters.dateRange.from.toISOString();
        query = query.gte('created_at', fromDate);
        
        if (filters.dateRange.to) {
          const toDate = filters.dateRange.to.toISOString();
          query = query.lte('created_at', toDate);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setLogs(data as AuditLog[]);
    } catch (error: any) {
      console.error('Error fetching AI decisions:', error);
      toast({
        title: 'Error fetching AI decisions',
        description: error.message || 'Failed to load AI decisions',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refetchLogs = () => {
    fetchAIDecisions();
  };

  return {
    logs,
    isLoading,
    filters,
    setFilters,
    refetchLogs
  };
}
