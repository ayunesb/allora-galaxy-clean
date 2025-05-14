
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AuditLogFilters from './logs/AuditLogFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import LogDetailDialog from './logs/LogDetailDialog';
import { AuditLogFilter, SystemEventModule, AuditLog } from '@/types/shared';

// Mock data for AuditLog while implementing real API
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    module: 'agent',
    event: 'create',
    action: 'Agent created',
    description: 'New agent version created',
    created_at: new Date().toISOString(),
    user_id: 'user1',
    tenant_id: 'tenant1'
  },
  {
    id: '2',
    module: 'strategy',
    event: 'update',
    action: 'Strategy updated',
    description: 'Strategy parameters modified',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_id: 'user2',
    tenant_id: 'tenant1'
  }
];

export function AuditLog({ onRefresh }: { onRefresh?: () => void }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilter>({});
  const [isMounted, setIsMounted] = useState(false);
  const moduleOptions: SystemEventModule[] = ['agent', 'strategy', 'plugin', 'tenant', 'system', 'api', 'auth', 'user'];

  // Fetch audit logs based on filters
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real application, this would call an API
      // For now, we'll use mock data with some filtering
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay
      
      let filteredLogs = [...mockAuditLogs];
      
      // Apply filters
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.description.toLowerCase().includes(term) || 
          log.action.toLowerCase().includes(term) ||
          log.module.toLowerCase().includes(term) ||
          log.event.toLowerCase().includes(term)
        );
      }
      
      if (filters.module) {
        filteredLogs = filteredLogs.filter(log => log.module === filters.module);
      }
      
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Initial fetch and filter changes
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchAuditLogs();
  };

  // Open log details dialog
  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Audit Logs</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-6 pt-2">
          <AuditLogFilters 
            filters={filters} 
            onFilterChange={setFilters} 
            modules={moduleOptions} 
          />
        </div>
        
        <ScrollArea className="h-[400px] w-full border-t">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {logs.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No logs found matching your filters.
                </div>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleLogClick(log)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        {log.module}
                      </span>
                      <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full">
                        {log.event}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {selectedLog && (
        <LogDetailDialog
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          log={selectedLog}
          title="Audit Log Details"
        />
      )}
    </Card>
  );
}

export default AuditLog;
