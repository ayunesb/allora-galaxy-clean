
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuditLog from './AuditLog';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { SystemLogsList } from '@/components/admin/logs/SystemLogsList';
import { AuditLogFilter, SystemLogFilter } from '@/types/shared';

export function EvolutionDashboard() {
  const [activeTab, setActiveTab] = useState<string>('audit-log');
  const [auditLogFilter, setAuditLogFilter] = useState<AuditLogFilter>({ searchTerm: '', module: undefined });
  const [systemLogFilter, _setSystemLogFilter] = useState<SystemLogFilter>({ 
    searchTerm: '', 
    module: undefined,
    level: undefined
  });
  
  // Fetch audit logs
  const { 
    logs: auditLogs, 
    isLoading: isAuditLogsLoading, 
    filters: auditFilters,
    modules: auditModules,
    fetchLogs: fetchAuditLogs,
    handleRefresh: refreshAuditLogs,
    handleFilterChange: handleAuditFilterChange
  } = useAuditLogData();
  
  // Fetch system logs
  const { 
    logs: systemLogs, 
    isLoading: isSystemLogsLoading,
    filters: systemFilters,
    refreshLogs: refreshSystemLogs,
    updateFilters: updateSystemFilters
  } = useSystemLogsData();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-8">
        <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
        <TabsTrigger value="system-logs">System Logs</TabsTrigger>
      </TabsList>
      
      <TabsContent value="audit-log">
        <AuditLog 
          logs={auditLogs}
          filters={auditFilters}
          modules={auditModules}
          isLoading={isAuditLogsLoading}
          onFilterChange={handleAuditFilterChange}
          onRefresh={refreshAuditLogs}
        />
      </TabsContent>
      
      <TabsContent value="system-logs">
        <SystemLogsList 
          logs={systemLogs}
          isLoading={isSystemLogsLoading}
          filters={systemFilters}
          onRefresh={refreshSystemLogs}
          onFilterChange={updateSystemFilters}
        />
      </TabsContent>
    </Tabs>
  );
}

export default EvolutionDashboard;
