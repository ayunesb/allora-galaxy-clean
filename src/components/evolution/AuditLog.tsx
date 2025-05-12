
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { AuditLogFilterState } from '@/components/evolution/logs/AuditLogFilters';
import AuditLogFilters from '@/components/evolution/logs/AuditLogFilters';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';

interface AuditLogProps {
  title?: string;
  subtitle?: string;
}

export const AuditLog: React.FC<AuditLogProps> = ({
  title = 'Audit Logs',
  subtitle = 'Track changes across the system'
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<AuditLogFilterState>({});
  
  const { logs, isLoading, refetch } = useAuditLogData(filters);

  const handleFilterChange = (newFilters: AuditLogFilterState) => {
    setFilters(newFilters);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <Separator className="my-2" />
        <AuditLogFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onRefresh={refetch}
          isLoading={isLoading}
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
            <SystemLogsList logs={logs} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="user">
            <SystemLogsList logs={logs.filter(log => 
              log.module === 'user' || log.module === 'auth'
            )} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="content">
            <SystemLogsList logs={logs.filter(log => 
              log.module === 'strategy' || log.module === 'plugin' || log.module === 'agent'
            )} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="system">
            <SystemLogsList logs={logs.filter(log => 
              log.module === 'system' || log.module === 'billing' || log.module === 'tenant'
            )} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuditLog;
