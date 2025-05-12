
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { useAiDecisions } from '@/hooks/admin/useAiDecisions';
import { AuditLog } from '@/types/logs';

const AiDecisions = () => {
  const { logs, isLoading, filters, setFilters, refetchLogs } = useAiDecisions();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Decisions</h1>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Decision Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemLogFilters 
              filters={filters}
              onFiltersChange={setFilters}
              isLoading={isLoading}
              onRefresh={refetchLogs}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Decision Events</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemLogsList 
              logs={logs} 
              isLoading={isLoading}
              onLogClick={handleLogClick}
            />
          </CardContent>
        </Card>
      </div>
      
      <LogDetailDialog 
        log={selectedLog} 
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
};

export default AiDecisions;
