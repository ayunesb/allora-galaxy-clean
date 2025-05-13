
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SystemLog, AuditLog, SystemLogFilterState } from '@/types/logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { SystemLogFilter } from '@/components/admin/system-logs';
import { SystemLogsList, LogTypeSelector, CombinedLogView } from '@/components/admin/logs';
import LogTransformationDialog from '@/components/evolution/LogTransformationDialog';
import { LogDetailDialog } from '@/components/evolution/logs';
import PageHelmet from '@/components/PageHelmet';
import { useLogFilterOptions } from '@/services/logService';
import { filterLogsBySearchTerm } from '@/lib/utils/logTransformations';

const EnhancedSystemLogs: React.FC = () => {
  const navigate = useNavigate();
  const [logType, setLogType] = useState<'system' | 'audit' | 'combined'>('system');
  const [selectedLog, setSelectedLog] = useState<SystemLog | AuditLog | null>(null);
  const [selectedLogType, setSelectedLogType] = useState<'system' | 'audit'>('system');
  const [transformDialogOpen, setTransformDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<SystemLogFilterState>({
    module: '',
    event: '',
    searchTerm: '',
    fromDate: null,
    toDate: null
  });
  
  // Get filter options
  const { modules, events } = useLogFilterOptions();
  
  // Fetch system logs
  const { 
    logs: systemLogs, 
    isLoading: systemLogsLoading, 
    refetch: refetchSystemLogs 
  } = useSystemLogsData();
  
  // Fetch audit logs
  const { 
    logs: auditLogs, 
    isLoading: auditLogsLoading, 
    refetch: refetchAuditLogs 
  } = useAuditLogData();
  
  // Apply frontend filtering
  const filteredSystemLogs = React.useMemo(() => {
    let filtered = systemLogs;
    
    if (filters.module) {
      filtered = filtered.filter(log => log.module === filters.module);
    }
    
    if (filters.event) {
      filtered = filtered.filter(log => log.event === filters.event);
    }
    
    if (filters.fromDate || filters.toDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.created_at);
        if (filters.fromDate && logDate < filters.fromDate) return false;
        if (filters.toDate) {
          const toDateEnd = new Date(filters.toDate);
          toDateEnd.setHours(23, 59, 59, 999);
          if (logDate > toDateEnd) return false;
        }
        return true;
      });
    }
    
    if (filters.searchTerm) {
      filtered = filterLogsBySearchTerm(filtered, filters.searchTerm);
    }
    
    return filtered;
  }, [systemLogs, filters]);
  
  // Apply similar filtering to audit logs
  const filteredAuditLogs = React.useMemo(() => {
    let filtered = auditLogs;
    
    if (filters.module) {
      filtered = filtered.filter(log => log.module === filters.module || log.entity_type === filters.module);
    }
    
    if (filters.event) {
      filtered = filtered.filter(log => log.event === filters.event || log.action === filters.event);
    }
    
    if (filters.fromDate || filters.toDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.created_at);
        if (filters.fromDate && logDate < filters.fromDate) return false;
        if (filters.toDate) {
          const toDateEnd = new Date(filters.toDate);
          toDateEnd.setHours(23, 59, 59, 999);
          if (logDate > toDateEnd) return false;
        }
        return true;
      });
    }
    
    if (filters.searchTerm) {
      filtered = filterLogsBySearchTerm(filtered, filters.searchTerm);
    }
    
    return filtered;
  }, [auditLogs, filters]);
  
  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    setFilters(newFilters);
  };
  
  const handleRefresh = () => {
    refetchSystemLogs();
    refetchAuditLogs();
  };
  
  const handleResetFilters = () => {
    setFilters({
      module: '',
      event: '',
      searchTerm: '',
      fromDate: null,
      toDate: null
    });
  };
  
  const handleViewSystemLog = (log: SystemLog) => {
    setSelectedLog(log);
    setSelectedLogType('system');
    setDetailsDialogOpen(true);
  };
  
  const handleViewAuditLog = (log: AuditLog) => {
    setSelectedLog(log);
    setSelectedLogType('audit');
    setDetailsDialogOpen(true);
  };
  
  const handleViewCombinedLog = (log: SystemLog | AuditLog, type: 'system' | 'audit') => {
    setSelectedLog(log);
    setSelectedLogType(type);
    setDetailsDialogOpen(true);
  };
  
  const handleTransformLog = () => {
    if (selectedLog) {
      setTransformDialogOpen(true);
    }
  };
  
  const handleViewDetailPage = () => {
    if (selectedLog) {
      navigate(`/admin/logs/${selectedLog.id}`);
    }
  };
  
  const isLoading = systemLogsLoading || auditLogsLoading;
  
  return (
    <>
      <PageHelmet
        title="System Logs"
        description="View and filter system logs"
      />
      
      <div className="container py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">System Logs</h1>
          <LogTypeSelector
            value={logType}
            onChange={(value) => setLogType(value as 'system' | 'audit' | 'combined')}
            disabled={isLoading}
          />
        </div>
        
        <SystemLogFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
        
        <div className="mt-6">
          {logType === 'system' && (
            <Card>
              <CardHeader className="py-4">
                <CardTitle>System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemLogsList
                  logs={filteredSystemLogs}
                  isLoading={systemLogsLoading}
                  onViewLog={handleViewSystemLog}
                />
              </CardContent>
            </Card>
          )}
          
          {logType === 'audit' && (
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemLogsList
                  logs={filteredAuditLogs.map(log => ({
                    id: log.id,
                    module: log.entity_type || log.module || '',
                    event: log.action || log.event || '',
                    description: log.description || log.details?.message || '',
                    context: log.context || log.details,
                    created_at: log.created_at,
                    tenant_id: log.tenant_id,
                    user_id: log.user_id
                  }))}
                  isLoading={auditLogsLoading}
                  onViewLog={(log) => {
                    // Find the original audit log
                    const originalLog = auditLogs.find(l => l.id === log.id);
                    if (originalLog) {
                      handleViewAuditLog(originalLog);
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}
          
          {logType === 'combined' && (
            <CombinedLogView
              systemLogs={filteredSystemLogs}
              auditLogs={filteredAuditLogs}
              isLoading={isLoading}
              onViewLog={handleViewCombinedLog}
            />
          )}
        </div>
      </div>
      
      {selectedLog && (
        <LogDetailDialog
          log={selectedLog as AuditLog}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
      
      {selectedLog && (
        <LogTransformationDialog
          log={selectedLog}
          type={selectedLogType}
          open={transformDialogOpen}
          onOpenChange={setTransformDialogOpen}
        />
      )}
    </>
  );
};

export default EnhancedSystemLogs;
