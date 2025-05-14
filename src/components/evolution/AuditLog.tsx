
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import AuditLogFilters from '@/components/evolution/logs/AuditLogFilters';
import { SystemLog } from '@/types/logs';
import LogDetailDialog from './logs/LogDetailDialog';

interface AuditLogProps {
  logs: SystemLog[];
  isLoading?: boolean;
  onRefresh?: () => void;
  title?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({
  logs = [],
  isLoading = false,
  onRefresh = () => {},
  title = "Audit Log"
}) => {
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Extract unique modules from logs
  const modules = [...new Set(logs.map(log => log.module))].filter(Boolean);

  // Filter logs based on selected module and search term
  const filteredLogs = logs.filter(log => {
    const moduleMatch = moduleFilter === 'all' || log.module === moduleFilter;
    const searchMatch = !searchTerm || 
      (log.event && log.event.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.module && log.module.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return moduleMatch && searchMatch;
  });

  const handleClearFilters = () => {
    setModuleFilter('all');
    setSearchTerm('');
  };

  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AuditLogFilters
          modules={modules}
          selectedModule={moduleFilter}
          searchTerm={searchTerm}
          onModuleChange={setModuleFilter}
          onSearchChange={setSearchTerm}
          onClearFilters={handleClearFilters}
        />
        
        <SystemLogsList 
          logs={filteredLogs} 
          isLoading={isLoading} 
          onViewLog={handleViewLog}
        />

        <LogDetailDialog
          log={selectedLog}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
