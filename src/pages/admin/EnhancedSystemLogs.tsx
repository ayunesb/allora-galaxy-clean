
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PageHelmet from '@/components/PageHelmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemLog, AuditLog, LogFilters } from '@/types';
import { useSystemLogs, useAuditLogs, useLogModules, useLogEvents } from '@/services/logService';
import { LogsList } from '@/components/evolution/logs';
import { LogDetailView } from '@/components/admin/logs';
import { LogFilterBar } from '@/components/admin/logs';
import { Card, CardContent } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';

const EnhancedSystemLogs: React.FC = () => {
  // State for filters
  const [activeTab, setActiveTab] = useState<string>('system');
  const [selectedLog, setSelectedLog] = useState<SystemLog | AuditLog | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    searchTerm: '',
    module: '',
    event: '',
    fromDate: null,
    toDate: null,
    limit: 50
  });
  
  const queryClient = useQueryClient();
  
  // Fetch log data based on active tab and filters
  const { 
    data: systemLogs = [], 
    isLoading: systemLogsLoading,
    refetch: refetchSystemLogs
  } = useSystemLogs(activeTab === 'system' ? filters : { limit: 0 });
  
  const { 
    data: auditLogs = [], 
    isLoading: auditLogsLoading,
    refetch: refetchAuditLogs
  } = useAuditLogs(activeTab === 'audit' ? filters : { limit: 0 });
  
  // Fetch filter options
  const { data: modules = [] } = useLogModules();
  const { data: events = [] } = useLogEvents();
  
  // Determine which logs to show based on active tab
  const isLoading = activeTab === 'system' ? systemLogsLoading : auditLogsLoading;
  const logs = activeTab === 'system' ? systemLogs : auditLogs;
  
  // Handle log selection
  const handleSelectLog = (log: SystemLog | AuditLog) => {
    setSelectedLog(log);
  };
  
  // Handle filter changes
  const handleFilterChange = (key: keyof LogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSelectedLog(null); // Reset selected log when filters change
  };
  
  // Handle date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters(prev => ({
      ...prev,
      fromDate: range?.from || null,
      toDate: range?.to || null
    }));
    setSelectedLog(null);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === 'system') {
      queryClient.invalidateQueries({ queryKey: ['systemLogs'] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
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
                searchTerm={filters.searchTerm || ''}
                onSearchChange={(value) => handleFilterChange('searchTerm', value)}
                module={filters.module || ''}
                onModuleChange={(value) => handleFilterChange('module', value)}
                event={filters.event || ''}
                onEventChange={(value) => handleFilterChange('event', value)}
                dateRange={
                  filters.fromDate || filters.toDate
                    ? { from: filters.fromDate || undefined, to: filters.toDate || undefined }
                    : null
                }
                onDateRangeChange={handleDateRangeChange}
                modules={modules}
                events={events}
                onRefresh={handleRefresh}
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
