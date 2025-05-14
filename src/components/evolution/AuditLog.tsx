
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditLog as AuditLogType } from '@/types/evolution';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import AuditLogFilters from '@/components/evolution/logs/AuditLogFilters';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { SystemLog } from '@/types/logs';

interface AuditLogProps {
  title: string;
  logs: AuditLogType[];
  isLoading: boolean;
  onRefresh: () => void;
}

const AuditLog: React.FC<AuditLogProps> = ({
  title,
  logs,
  isLoading,
  onRefresh
}) => {
  const [filters, setFilters] = useState({
    module: 'all',
    event: 'all'
  });
  
  // Convert AuditLog to SystemLog for compatibility with SystemLogsList
  const convertedLogs: SystemLog[] = logs.map(log => ({
    id: log.id || '',
    tenant_id: log.tenant_id,
    module: log.module || 'system',
    event: log.event || 'unknown',
    created_at: log.created_at || new Date().toISOString(),
    context: log.context || {}
  }));
  
  // Apply filters
  const filteredLogs = convertedLogs.filter(log => {
    if (filters.module !== 'all' && log.module !== filters.module) {
      return false;
    }
    if (filters.event !== 'all' && log.event !== filters.event) {
      return false;
    }
    return true;
  });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        <AuditLogFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      </CardHeader>
      <CardContent>
        <SystemLogsList 
          logs={filteredLogs}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
