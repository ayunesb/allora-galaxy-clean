
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import SystemLogFilter from '@/components/admin/logs/SystemLogFilters';
import { AuditLog } from '@/types/logs';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

const AiDecisions = () => {
  const initialFilters = { 
    searchTerm: '',
    module: 'ai' 
  };

  const {
    logs,
    loading,
    filters,
    modules,
    fetchLogs,
    handleFilterChange,
  } = useSystemLogsData({ initialFilters });
  
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState<boolean>(false);

  const handleOpenLogDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">AI Decisions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Activities & Decisions</CardTitle>
          <SystemLogFilter 
            onFilterChange={handleFilterChange}
            filters={filters}
            modules={modules}
            onRefresh={fetchLogs}
            isLoading={loading}
          />
        </CardHeader>
        <CardContent className="p-0">
          <SystemLogsList
            logs={logs}
            isLoading={loading}
            onLogClick={handleOpenLogDetail}
          />
        </CardContent>
      </Card>
      
      {selectedLog && (
        <LogDetailDialog 
          log={selectedLog} 
          open={showLogDetail} 
          onOpenChange={setShowLogDetail} 
        />
      )}
    </div>
  );
};

export default AiDecisions;
