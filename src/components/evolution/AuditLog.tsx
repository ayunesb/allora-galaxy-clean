
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { AuditLogFilterState } from '@/components/evolution/logs/AuditLogFilters';
import AuditLogFilters from '@/components/evolution/logs/AuditLogFilters';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import { AuditLog as AuditLogType, SystemLog } from '@/types/logs';

export interface AuditLogProps {
  title?: string;
  subtitle?: string;
  data?: AuditLogType[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({
  title = 'Audit Logs',
  subtitle = 'Track changes across the system',
  data,
  isLoading,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<AuditLogFilterState>({
    module: '',
    event: '',
    fromDate: null,
    toDate: null,
    searchTerm: ''
  });
  
  // If data is not provided as props, use the hook to fetch the data
  const hookData = useAuditLogData(filters as any);
  const logs = data || hookData.logs;
  const loading = isLoading !== undefined ? isLoading : hookData.isLoading;
  const handleRefresh = onRefresh || hookData.refetch;

  const handleFilterChange = (newFilters: AuditLogFilterState) => {
    setFilters(newFilters);
  };

  // Convert AuditLogType[] to SystemLog[] for SystemLogsList compatibility
  const mapAuditLogsToSystemLogs = (auditLogs: AuditLogType[]): SystemLog[] => {
    return auditLogs.map(log => ({
      id: log.id,
      module: log.module || ('system' as any), // Default to 'system' if not provided
      event: log.event || (log.action as any), // Use action as event if event is not provided
      context: log.details || {},
      created_at: log.created_at,
      tenant_id: log.tenant_id
    }));
  };
  
  const mappedLogs = mapAuditLogsToSystemLogs(logs);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <Separator className="my-2" />
        <AuditLogFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          isLoading={loading}
        />
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Activity</TabsTrigger>
              <TabsTrigger value="user">User Events</TabsTrigger>
              <TabsTrigger value="content">Content Changes</TabsTrigger>
              <TabsTrigger value="system">System Events</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all">
            <SystemLogsList logs={mappedLogs} isLoading={loading} />
          </TabsContent>
          
          <TabsContent value="user">
            <SystemLogsList 
              logs={mappedLogs.filter(log => 
                log.module === 'user' || log.module === 'auth'
              )} 
              isLoading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="content">
            <SystemLogsList 
              logs={mappedLogs.filter(log => 
                log.module === 'strategy' || log.module === 'plugin' || log.module === 'agent'
              )} 
              isLoading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="system">
            <SystemLogsList 
              logs={mappedLogs.filter(log => 
                log.module === 'system' || log.module === 'billing' || log.module === 'tenant'
              )} 
              isLoading={loading} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuditLog;
