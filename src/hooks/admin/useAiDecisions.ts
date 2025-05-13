
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SystemLog, LogFilters } from '@/types/logs';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export function useAiDecisionsData() {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [decisions, setDecisions] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({
    module: 'agent',
    event: null,
    fromDate: null,
    toDate: null,
    searchTerm: '',
    limit: 100
  });
  
  const fetchDecisions = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .eq('module', 'agent')
        .order('created_at', { ascending: false });
      
      // Apply event filter if provided
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      // Apply date range filters if provided
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate.toISOString());
      }
      
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate.toISOString());
      }
      
      // Apply search term if provided
      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,context.ilike.%${filters.searchTerm}%`);
      }
      
      // Apply limit if provided
      query = query.limit(filters.limit || 100);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Also fetch agent evolution events
      const { data: evolutionData, error: evolutionError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .eq('module', 'evolution')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (evolutionError) throw evolutionError;
      
      // Combine both datasets
      const combinedData = [...(data || []), ...(evolutionData || [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setDecisions(combinedData);
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
  }, [currentWorkspace?.id, filters, toast]);
  
  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);
  
  return {
    decisions,
    isLoading,
    filters,
    setFilters,
    refetch: fetchDecisions
  };
}
