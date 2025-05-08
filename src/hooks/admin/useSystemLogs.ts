
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemLog {
  id: string;
  module: string;
  event: string;
  created_at: string;
  context: Record<string, any>;
  tenant_id: string;
}

interface UseSystemLogsReturn {
  logs: SystemLog[];
  loading: boolean;
  error: string | null;
  selectedModule: string | null;
  setSelectedModule: (module: string | null) => void;
  selectedEvent: string | null;
  setSelectedEvent: (event: string | null) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  modules: string[];
  events: string[];
  resetFilters: () => void;
  refreshLogs: () => void;
}

export function useSystemLogs(tenantId: string | null): UseSystemLogsReturn {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  
  // Filters
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchLogs = async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (selectedModule) {
        query = query.eq('module', selectedModule);
      }
      
      if (selectedEvent) {
        query = query.eq('event', selectedEvent);
      }
      
      if (selectedDate) {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }
      
      if (searchTerm) {
        // This assumes the 'context' column is stored as JSONB and can be converted to text for search
        // For more specific search you might want to adjust this based on your data structure
        query = query.textSearch('context', searchTerm, { config: 'english' });
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw new Error(`Error fetching system logs: ${fetchError.message}`);
      }
      
      setLogs(data || []);
      
      // Extract unique modules and events for filters
      if (data) {
        const uniqueModules = [...new Set(data.map(log => log.module))];
        const uniqueEvents = [...new Set(data.map(log => log.event))];
        
        setModules(uniqueModules);
        setEvents(uniqueEvents);
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error loading logs',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedModule(null);
    setSelectedEvent(null);
    setSelectedDate(null);
    setSearchTerm('');
  };

  const refreshLogs = () => {
    fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, [tenantId, selectedModule, selectedEvent, selectedDate, searchTerm]);

  return {
    logs,
    loading,
    error,
    selectedModule,
    setSelectedModule,
    selectedEvent,
    setSelectedEvent,
    selectedDate,
    setSelectedDate,
    searchTerm,
    setSearchTerm,
    modules,
    events,
    resetFilters,
    refreshLogs
  };
}
