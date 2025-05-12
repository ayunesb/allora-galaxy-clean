
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { AuditLog } from '@/types/logs';
import AuditLogFilters from '@/components/evolution/logs/AuditLogFilters';

const AiDecisions = () => {
  const {
    logs,
    isLoading,
    filters,
    modules,
    actions,
    handleFilterChange,
    handleRefresh,
  } = useAuditLogData();
  
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('decisions');

  const filterLogsByType = (logs: AuditLog[], type: string) => {
    switch (type) {
      case 'decisions':
        return logs.filter(log => 
          log.module === 'ai' || 
          log.module === 'strategy' || 
          log.module === 'agent'
        );
      case 'executions':
        return logs.filter(log => 
          log.event?.toLowerCase().includes('executed') || 
          log.event?.toLowerCase().includes('run') ||
          log.action === 'execute'
        );
      case 'all':
      default:
        return logs;
    }
  };

  const filteredLogs = filterLogsByType(logs, activeTab);

  const handleOpenLogDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">AI Decisions & Executions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Decision Logs</CardTitle>
          <CardDescription>
            Track and audit AI decisions, strategy executions and agent actions
          </CardDescription>
          
          <Tabs defaultValue="decisions" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="decisions">AI Decisions</TabsTrigger>
              <TabsTrigger value="executions">Strategy Executions</TabsTrigger>
              <TabsTrigger value="all">All Activity</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <AuditLogFilters
            onFilterChange={handleFilterChange}
            filters={filters}
            modules={modules}
            actions={actions}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            <div className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 items-center gap-4 p-4 hover:bg-secondary cursor-pointer"
                  onClick={() => handleOpenLogDetail(log)}
                >
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {format(new Date(log.created_at), 'MMM dd, yyyy hh:mm:ss')}
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary">{log.module}</Badge>
                    {log.action && (
                      <Badge variant="outline" className="ml-1">
                        {log.action}
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-8">{log.event}</div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  {isLoading ? 'Loading logs...' : 'No logs found.'}
                </div>
              )}
            </div>
          </ScrollArea>
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
