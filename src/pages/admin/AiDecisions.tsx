
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useAiDecisions } from '@/hooks/admin/useAiDecisions';
import { SystemLog } from '@/types/logs';
import { SystemLogsList, SystemLogFilters, SystemLogFilterState } from '@/components/admin/logs';
import { LogDetailDialog } from '@/components/evolution/logs';
import AdminLayout from '@/components/layout/AdminLayout';

const AiDecisions: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<SystemLogFilterState>({
    module: 'ai',
    event: '',
    fromDate: null,
    toDate: null,
    searchTerm: ''
  });
  
  const { decisions, isLoading, error, refetch } = useAiDecisions();
  
  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    setFilters(newFilters);
    // In a real implementation, we would apply the filters to the useAiDecisions hook
  };
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <PageHeader
          title="AI Decisions"
          description="View and audit AI decision-making processes"
        />
        
        <div className="mb-6">
          <SystemLogFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </div>
        
        <Card className="mt-6">
          <CardContent className="p-0 sm:p-6">
            <SystemLogsList 
              logs={decisions} 
              isLoading={isLoading} 
              onViewLog={handleViewLog}
            />
            
            {error && (
              <p className="text-red-500 p-4">
                Error loading decisions: {error}
              </p>
            )}
          </CardContent>
        </Card>
        
        <LogDetailDialog 
          log={selectedLog} 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
        />
      </div>
    </AdminLayout>
  );
};

export default AiDecisions;
