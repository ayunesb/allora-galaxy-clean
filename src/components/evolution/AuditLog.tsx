
import React, { useState } from 'react';
import AuditLogFilters, { AuditLogFilters as FilterState } from './logs/AuditLogFilters';
import AuditLogTable from './logs/AuditLogTable';
import LogDetailDialog from './logs/LogDetailDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditLog as Log } from './logs/AuditLogTable';

export interface AuditLogProps {
  title?: string;
  onRefresh: () => void;
  isLoading: boolean;
  data: Log[];
}

const AuditLog: React.FC<AuditLogProps> = ({ 
  title = 'System Logs',
  onRefresh, 
  isLoading,
  data
}) => {
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // In a real implementation, this would trigger a re-fetch with the updated filters
  };

  const handleViewLog = (log: Log) => {
    setSelectedLog(log);
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
      const matchesEvent = log.event?.toLowerCase().includes(searchTerm) || 
                          log.event_type?.toLowerCase().includes(searchTerm);
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
            logs={filteredLogs} 
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
