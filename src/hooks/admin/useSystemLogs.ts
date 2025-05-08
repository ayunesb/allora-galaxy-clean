
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemLog {
  id: string;
  tenant_id: string;
  module: string;
  event: string;
  created_at: string;
  context: any;
}

export const useSystemLogs = (tenantId: string | null) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  
  const { toast } = useToast();
  
  const loadSystemLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      // Base query
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (selectedModule) {
        query = query.eq('module', selectedModule);
      }
      
      if (selectedEvent) {
        query = query.eq('event', selectedEvent);
      }
      
      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
      }
      
      if (searchTerm) {
        query = query.textSearch('event', searchTerm);
      }
      
      // Limited to 100 logs for now
      query = query.limit(100);
      
      const { data, error: logsError } = await query;
      
      if (logsError) throw logsError;
      
      setLogs(data || []);
      
      // Extract unique modules and events for filters
      if (data && data.length > 0) {
        const uniqueModules = [...new Set(data.map(log => log.module))];
        const uniqueEvents = [...new Set(data.map(log => log.event))];
        setModules(uniqueModules);
        setEvents(uniqueEvents);
      }
      
    } catch (err: any) {
      console.error('Error loading system logs:', err);
      setError(err.message);
      toast({
        title: 'Error loading logs',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedModule, selectedEvent, selectedDate, searchTerm, toast]);
  
  const resetFilters = () => {
    setSelectedModule('');
    setSelectedEvent('');
    setSelectedDate(undefined);
    setSearchTerm('');
  };
  
  useEffect(() => {
    if (tenantId) {
      loadSystemLogs();
    }
  }, [tenantId, selectedModule, selectedEvent, selectedDate, loadSystemLogs]);
  
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
    refreshLogs: loadSystemLogs,
  };
};
