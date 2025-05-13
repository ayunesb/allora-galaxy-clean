
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useAiDecisionsData } from '@/hooks/admin/useAiDecisions';
import { SystemLog, LogFilters } from '@/types/logs';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { SystemLogFilters, SystemLogFilterState } from '@/components/admin/logs/SystemLogFilters';

const AiDecisions: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { decisions, isLoading, filters, setFilters, refetch } = useAiDecisionsData();
  
  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    // Convert SystemLogFilterState to LogFilters
    // Handle empty string for module by converting to null
    const updatedFilters: LogFilters = {
      ...filters,
      module: newFilters.module === '' ? null : newFilters.module as any,
      event: newFilters.event === '' ? null : newFilters.event as any,
      fromDate: newFilters.fromDate || null,
      toDate: newFilters.toDate || null,
      searchTerm: newFilters.searchTerm || ''
    };
    
    setFilters(updatedFilters);
  };
  
  return (
    <div className="container py-6">
      <PageHeader
        title="AI Decisions"
        description="Monitor and audit AI-generated decisions and recommendations"
      />
      
      <SystemLogFilters 
        filters={{
          module: filters.module || '',
          event: filters.event || '',
          fromDate: filters.fromDate || null,
          toDate: filters.toDate || null,
          searchTerm: filters.searchTerm || ''
        }}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        onRefresh={refetch}
      />
      
      <Card className="mt-6">
        <CardContent className="p-0 sm:p-6">
          <SystemLogsList 
            logs={decisions} 
            isLoading={isLoading} 
            onViewLog={handleViewLog}
          />
        </CardContent>
      </Card>
      
      <LogDetailDialog 
        log={selectedLog} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
};

export default AiDecisions;
