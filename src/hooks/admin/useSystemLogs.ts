
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemEventModule, SystemEventType } from '@/types/shared';

interface Log {
  id: string;
  module: SystemEventModule;
  event: SystemEventType;
  created_at: string;
  context?: Record<string, any>;
  tenant_id?: string;
}

export function useSystemLogs(tenantId: string | null) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedModule, setSelectedModule] = useState<SystemEventModule | ''>('');
  const [selectedEvent, setSelectedEvent] = useState<SystemEventType | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Metadata
  const [modules, setModules] = useState<SystemEventModule[]>([]);
  const [events, setEvents] = useState<SystemEventType[]>([]);

  const fetchLogs = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      setError(null);
      
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
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }
      
      if (searchTerm) {
        query = query.or(
          `event.ilike.%${searchTerm}%,module.ilike.%${searchTerm}%,context.ilike.%${searchTerm}%`
        );
      }
      
      const { data, error: fetchError } = await query.limit(100);
      
      if (fetchError) {
        throw fetchError;
      }
      
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching system logs:', err);
      setError(err.message || 'Failed to load system logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedModule, selectedEvent, selectedDate, searchTerm]);
  
  const fetchModulesAndEvents = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      // Fetch distinct modules
      const { data: moduleData, error: moduleError } = await supabase
        .from('system_logs')
        .select('module')
        .eq('tenant_id', tenantId)
        .distinct();
      
      if (moduleError) throw moduleError;
      
      // Fetch distinct events
      const { data: eventData, error: eventError } = await supabase
        .from('system_logs')
        .select('event')
        .eq('tenant_id', tenantId)
        .distinct();
      
      if (eventError) throw eventError;
      
      setModules(moduleData.map(item => item.module).filter(Boolean) as SystemEventModule[]);
      setEvents(eventData.map(item => item.event).filter(Boolean) as SystemEventType[]);
    } catch (err: any) {
      console.error('Error fetching filters:', err);
    }
  }, [tenantId]);
  
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  useEffect(() => {
    fetchModulesAndEvents();
  }, [fetchModulesAndEvents]);
  
  const resetFilters = useCallback(() => {
    setSelectedModule('');
    setSelectedEvent('');
    setSelectedDate(null);
    setSearchTerm('');
  }, []);
  
  const refreshLogs = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);
  
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
