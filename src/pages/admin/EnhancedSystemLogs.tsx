
import React, { useState } from 'react';
import PageHelmet from '@/components/PageHelmet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemLog, AuditLog } from '@/types';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { useAuditLogs, useLogModules, useLogEvents } from '@/services/logService';
import { Card, CardContent } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { LogFilterBar } from '@/components/admin/logs';
import { LogsList } from '@/components/evolution/logs';
import { LogDetailView } from '@/components/admin/logs';

const EnhancedSystemLogs: React.FC = () => {
  // State for active tab and selected log
  const [activeTab, setActiveTab] = useState<string>('system');
  const [selectedLog, setSelectedLog] = useState<SystemLog | AuditLog | null>(null);
  
  // System logs data hook
  const {
    logs: systemLogs,
    isLoading: systemLogsLoading,
    filters: systemFilters,
    setFilters: setSystemFilters,
    resetFilters: resetSystemFilters,
    refetch: refreshSystemLogs,
    modules,
    events
  } = useSystemLogsData();
  
  // Audit logs query
  const { 
    data: auditLogs = [], 
    isLoading: auditLogsLoading,
    refetch: refreshAuditLogs
  } = useAuditLogs(
    activeTab === 'audit' 
      ? {
          searchTerm: systemFilters.searchTerm,
          module: systemFilters.module,
          event: systemFilters.event,
          dateRange: systemFilters.fromDate || systemFilters.toDate
            ? { from: systemFilters.fromDate, to: systemFilters.toDate }
            : undefined,
          limit: 50
        } 
      : { limit: 0 }
  );
  
  // Determine which logs to show based on active tab
  const isLoading = activeTab === 'system' ? systemLogsLoading : auditLogsLoading;
  const logs = activeTab === 'system' ? systemLogs : auditLogs;
  
  // Handle changing filters
  const handleFilterChange = (key: string, value: any) => {
    setSelectedLog(null);
    setSystemFilters({
      ...systemFilters,
      [key]: value
    });
  };
  
  // Handle date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setSelectedLog(null);
    setSystemFilters({
      ...systemFilters,
      fromDate: range?.from || null,
      toDate: range?.to || null
    });
  };
  
  // Handle log selection
  const handleSelectLog = (log: SystemLog | AuditLog) => {
    setSelectedLog(log);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === 'system') {
      refreshSystemLogs();
    } else {
      refreshAuditLogs();
    }
  };
  
  return (
    <>
      <PageHelmet
        title="System Logs"
        description="View and analyze system and audit logs"
      />
      
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">System Logs</h1>
            <p className="text-muted-foreground">
              View and analyze system and audit logs to monitor application health
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="system">System Logs</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            </TabsList>
            
            <div className="mb-4">
              <LogFilterBar
                searchTerm={systemFilters.searchTerm}
                onSearchChange={(value) => handleFilterChange('searchTerm', value)}
                module={systemFilters.module}
                onModuleChange={(value) => handleFilterChange('module', value)}
                event={systemFilters.event}
                onEventChange={(value) => handleFilterChange('event', value)}
                dateRange={
                  systemFilters.fromDate || systemFilters.toDate
                    ? { from: systemFilters.fromDate || undefined, to: systemFilters.toDate || undefined }
                    : undefined
                }
                onDateRangeChange={handleDateRangeChange}
                modules={modules}
                events={events}
                onRefresh={handleRefresh}
                onReset={resetSystemFilters}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-0">
                  <LogsList
                    logs={logs}
                    onSelectLog={handleSelectLog}
                    selectedLogId={selectedLog?.id}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
              
              <div>
                {selectedLog ? (
                  <LogDetailView log={selectedLog} />
                ) : (
                  <Card className="h-full flex items-center justify-center text-muted-foreground">
                    <CardContent>
                      Select a log to view details
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default EnhancedSystemLogs;
