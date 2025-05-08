
import React from 'react';
import { useTenantId } from '@/hooks/useTenantId';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import AdminGuard from '@/components/guards/AdminGuard';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import SystemLogsTable from '@/components/admin/logs/SystemLogsTable';
import { useSystemLogs } from '@/hooks/admin/useSystemLogs';
import { SystemEventModule, SystemEventType } from '@/types/shared';

const SystemLogs: React.FC = () => {
  const tenantId = useTenantId();
  const {
    logs,
    loading,
    error,
    selectedModule,
    setSelectedModule,
    selectedEvent,
    setSelectedEvent,
    selectedDate,
    setSelectedDate,
    searchTerm,
    setSearchTerm,
    modules,
    events,
    resetFilters,
    refreshLogs,
  } = useSystemLogs(tenantId);

  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>
              View system activity and event logs for your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SystemLogFilters
              modules={modules as SystemEventModule[]}
              events={events as SystemEventType[]}
              selectedModule={selectedModule as SystemEventModule | ""}
              selectedEvent={selectedEvent as SystemEventType | ""}
              selectedDate={selectedDate}
              searchTerm={searchTerm || ""}
              setSelectedModule={(module) => setSelectedModule(module)}
              setSelectedEvent={(event) => setSelectedEvent(event)}
              setSelectedDate={setSelectedDate}
              setSearchTerm={setSearchTerm}
              resetFilters={resetFilters}
              refreshLogs={refreshLogs}
            />
            
            {error && (
              <Alert variant="destructive" className="mb-6 mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="mt-6">
              <SystemLogsTable logs={logs} loading={loading} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
};

export default SystemLogs;
