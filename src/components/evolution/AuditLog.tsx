
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import AuditLogFilters from '@/components/evolution/logs/AuditLogFilters';

interface AuditLogProps {
  logs: any[];
  isLoading?: boolean;
}

const AuditLog: React.FC<AuditLogProps> = ({ logs = [], isLoading = false }) => {
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract unique modules from logs
  const modules = [...new Set(logs.map(log => log.module))].filter(Boolean);

  // Filter logs based on selected module and search term
  const filteredLogs = logs.filter(log => {
    const moduleMatch = moduleFilter === 'all' || log.module === moduleFilter;
    const searchMatch = !searchTerm || 
      (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.event && log.event.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return moduleMatch && searchMatch;
  });

  const handleClearFilters = () => {
    setModuleFilter('all');
    setSearchTerm('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
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
        
        <SystemLogsList logs={filteredLogs} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
