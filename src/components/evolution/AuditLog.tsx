
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import AuditLogFilters from './logs/AuditLogFilters';
import AuditLogTable from './logs/AuditLogTable';
import LogDetailDialog from './logs/LogDetailDialog';

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

  // Handle filter changes
  const handleFilterChange = (newFilters: AuditLogFilterState) => {
    setFilterState(newFilters);
    // Apply filters to logs...
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
    // Implement refresh logs logic...
    toast({
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
