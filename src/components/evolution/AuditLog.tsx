
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuditLogFilters, { AuditLogFilterState } from './logs/AuditLogFilters';
import AuditLogTable, { AuditLogEntry } from './logs/AuditLogTable';
import LogDetailDialog from './logs/LogDetailDialog';

export const AuditLog: React.FC = () => {
  const tenantId = useTenantId();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<AuditLogFilterState>({
    moduleFilter: '',
    eventFilter: '',
    searchQuery: '',
    selectedDate: null
  });

  const fetchLogs = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (filters.moduleFilter) {
        query = query.eq('module', filters.moduleFilter);
      }
      
      if (filters.eventFilter) {
        query = query.eq('event_type', filters.eventFilter);
      }
      
      if (filters.searchQuery) {
        query = query.or(`details.ilike.%${filters.searchQuery}%,user_id.ilike.%${filters.searchQuery}%`);
      }
      
      if (filters.selectedDate) {
        const startDate = filters.selectedDate.toISOString().split('T')[0];
        const endDate = new Date(filters.selectedDate);
        endDate.setDate(endDate.getDate() + 1);
        const endDateString = endDate.toISOString().split('T')[0];
        
        query = query.gte('created_at', startDate).lt('created_at', endDateString);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      
      setLogs(data || []);
      
      // Extract unique modules and events for filters
      if (data) {
        const uniqueModules = [...new Set(data.map(log => log.module))];
        const uniqueEvents = [...new Set(data.map(log => log.event_type))];
        setModules(uniqueModules);
        setEvents(uniqueEvents);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (tenantId) {
      fetchLogs();
    }
  }, [tenantId, filters]);

  const handleFilterChange = (newFilters: AuditLogFilterState) => {
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      moduleFilter: '',
      eventFilter: '',
      searchQuery: '',
      selectedDate: null
    });
  };
  
  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <AuditLogFilters
          moduleFilter={filters.moduleFilter}
          eventFilter={filters.eventFilter}
          searchQuery={filters.searchQuery}
          selectedDate={filters.selectedDate}
          onReset={handleResetFilters}
          onFilterChange={handleFilterChange}
          modules={modules}
          events={events}
        />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AuditLogTable logs={logs} onViewDetails={handleViewDetails} />
        )}
        
        <LogDetailDialog
          log={selectedLog as any}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
