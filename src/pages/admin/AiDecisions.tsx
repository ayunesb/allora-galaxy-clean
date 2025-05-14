
import React, { useState } from 'react';
import PageHelmet from '@/components/PageHelmet';
import { Card, CardContent } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { SystemLogFilters } from '@/components/admin/logs/SystemLogFilters';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import { SystemLogFilter } from '@/types/shared';
import LogDetailDialog from '@/components/admin/logs/LogDetailDialog';

const AiDecisions: React.FC = () => {
  const [filter, setFilter] = useState<SystemLogFilter>({
    searchTerm: '',
    module: 'agent',
  });
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, refresh, modules, events } = useSystemLogsData(filter);

  const handleViewLogDetails = (log: any) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet title="AI Decisions" description="Review AI decision logs" />
      
      <h1 className="text-2xl font-bold mb-4">AI Decisions</h1>
      
      <Card>
        <CardContent className="p-6">
          <SystemLogFilters
            filter={filter}
            setFilter={setFilter}
            modules={modules}
            events={events}
            onRefresh={refresh}
            isLoading={isLoading}
            className="mb-6"
          />
          
          <SystemLogsList
            logs={data}
            isLoading={isLoading}
            title="AI Decision Logs"
            onViewDetails={handleViewLogDetails}
          />
        </CardContent>
      </Card>

      <LogDetailDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
      />
    </div>
  );
};

export default AiDecisions;
