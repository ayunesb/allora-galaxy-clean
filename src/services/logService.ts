
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';

/**
 * Fetch distinct module names from system logs
 */
export const useLogModules = (tenantId?: string) => {
  return useQuery({
    queryKey: ['log-modules', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('module')
        .is('module', 'not.null');
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching log modules:', error);
        throw error;
      }
      
      // Extract unique module names
      const modules = Array.from(new Set(data.map(item => item.module).filter(Boolean)));
      return modules;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch distinct event names from system logs
 */
export const useLogEvents = (tenantId?: string) => {
  return useQuery({
    queryKey: ['log-events', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('event')
        .is('event', 'not.null');
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching log events:', error);
        throw error;
      }
      
      // Extract unique event names
      const events = Array.from(new Set(data.map(item => item.event).filter(Boolean)));
      return events;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get all necessary data for log filters
 */
export const useLogFilterOptions = () => {
  const { tenantId } = useTenantId();
  
  const { 
    data: modules = [], 
    isLoading: isLoadingModules 
  } = useLogModules(tenantId);
  
  const { 
    data: events = [], 
    isLoading: isLoadingEvents 
  } = useLogEvents(tenantId);
  
  return {
    modules,
    events,
    isLoading: isLoadingModules || isLoadingEvents
  };
};
