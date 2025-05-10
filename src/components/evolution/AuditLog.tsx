
import React, { useState } from 'react';
import AuditLogFilters, { AuditLogFilters as FilterState } from './logs/AuditLogFilters';
import AuditLogTable, { AuditLog as Log } from './logs/AuditLogTable';
import LogDetailDialog from './logs/LogDetailDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditLog as SharedAuditLog } from '@/types/shared';

export interface AuditLogProps {
  title?: string;
  onRefresh: () => void;
  isLoading: boolean;
  data: SharedAuditLog[];
}

const AuditLog: React.FC<AuditLogProps> = ({ 
  title = 'System Logs',
  onRefresh, 
  isLoading,
  data
}) => {
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedLog, setSelectedLog] = useState<SharedAuditLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // In a real implementation, this would trigger a re-fetch with the updated filters
  };

  // Map SharedAuditLog to Log format expected by AuditLogTable
  const convertToTableFormat = (logs: SharedAuditLog[]): Log[] => {
    return logs.map(log => ({
      id: log.id,
      module: log.module,
      event_type: log.event_type,
      description: log.description || 'No description', // Ensure description is never undefined
      tenant_id: log.tenant_id,
      created_at: log.created_at,
      user_id: log.user_id,
      metadata: log.metadata
    }));
  };

  const handleViewLog = (log: Log) => {
    // Find the original log in data to ensure we're passing the proper type
    const originalLog = data.find(l => l.id === log.id) || null;
    setSelectedLog(originalLog);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Apply filters locally
  const filteredLogs = data.filter(log => {
    if (filters.module && log.module !== filters.module) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesEvent = log.event_type?.toLowerCase().includes(searchTerm);
      const matchesDescription = log.description?.toLowerCase().includes(searchTerm);
      if (!matchesEvent && !matchesDescription) return false;
    }
    // Time range filtering would happen here
    return true;
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AuditLogFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
        
        <div className="mt-4">
          <AuditLogTable 
            logs={convertToTableFormat(filteredLogs)} 
            isLoading={isLoading}
            onViewDetails={handleViewLog}
          />
        </div>
        
        <LogDetailDialog
          log={selectedLog}
          open={dialogOpen}
          onClose={handleCloseDialog}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
