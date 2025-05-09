
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import AuditLogFilters from './logs/AuditLogFilters';
import AuditLogTable from './logs/AuditLogTable';
import LogDetailDialog from './logs/LogDetailDialog';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog as AuditLogType } from '@/types/shared';

export interface AuditLogEntry {
  id: string;
  module: string;
  event_type: string;
  user_id: string | null;
  metadata: any;
  created_at: string;
  tenant_id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface AuditLogFilterState {
  moduleFilter: string;
  eventFilter: string;
  searchQuery: string;
  selectedDate: Date | null;
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filter state
  const [filterState, setFilterState] = useState<AuditLogFilterState>({
    moduleFilter: '',
    eventFilter: '',
    searchQuery: '',
    selectedDate: null
  });

  // Define filter options (you would populate these from your data)
  const modules = ['auth', 'strategy', 'tenant', 'user', 'plugin'];
  const events = ['created', 'updated', 'deleted', 'access', 'error'];

  useEffect(() => {
    // Fetch logs when component mounts or filters change
    fetchLogs();
  }, [filterState]);

  // Fetch logs based on current filters
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Start building the query
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply module filter if set
      if (filterState.moduleFilter) {
        query = query.eq('module', filterState.moduleFilter);
      }
      
      // Apply event filter if set
      if (filterState.eventFilter) {
        query = query.eq('event', filterState.eventFilter);
      }
      
      // Apply date filter if set
      if (filterState.selectedDate) {
        const startOfDay = new Date(filterState.selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(filterState.selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.gte('created_at', startOfDay.toISOString())
                     .lte('created_at', endOfDay.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch logs: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        // If search query is set, filter results client-side
        let filteredData = data || [];
        if (filterState.searchQuery) {
          const searchLower = filterState.searchQuery.toLowerCase();
          filteredData = filteredData.filter(log => 
            log.module?.toLowerCase().includes(searchLower) || 
            log.event?.toLowerCase().includes(searchLower) ||
            log.context && JSON.stringify(log.context).toLowerCase().includes(searchLower)
          );
        }
        
        setLogs(filteredData as AuditLogEntry[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching logs:', err);
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: AuditLogFilterState) => {
    setFilterState(newFilters);
  };

  // Handle log selection
  const handleViewLog = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  // Handle close detail view
  const closeDetailView = () => {
    setIsDetailOpen(false);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchLogs();
    toast({
      title: "Refreshed",
      description: "Logs refreshed",
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterState({
      moduleFilter: '',
      eventFilter: '',
      searchQuery: '',
      selectedDate: null
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          Track system actions and user events
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <AuditLogFilters
          modules={modules}
          events={events}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          moduleFilter={filterState.moduleFilter}
          eventFilter={filterState.eventFilter}
          searchQuery={filterState.searchQuery}
          selectedDate={filterState.selectedDate}
        />
        
        {/* Logs Table */}
        <AuditLogTable
          logs={logs}
          loading={loading}
          onViewLog={handleViewLog}
          onRefresh={handleRefresh}
        />
        
        {/* Log Detail Dialog */}
        {selectedLog && (
          <LogDetailDialog
            log={selectedLog}
            open={isDetailOpen}
            onClose={closeDetailView}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLog;
