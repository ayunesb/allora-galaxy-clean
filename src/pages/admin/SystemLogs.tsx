
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemLogFilters } from '@/components/admin/logs/SystemLogFilters';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import LoadingScreen from '@/components/LoadingScreen';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';

export interface SystemLog {
  id: string;
  tenant_id: string;
  module: string;
  type: string;
  level: string;
  description: string;
  metadata: any;
  created_at: string;
  user_id: string | null;
}

const SystemLogs: React.FC = () => {
  const {
    logs,
    isLoading,
    moduleFilter,
    eventFilter,
    searchQuery,
    selectedDate,
    selectedLog,
    setSelectedLog,
    modules,
    events,
    handleFilterChange,
    handleResetFilters,
    handleRefresh
  } = useSystemLogsData();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>
            View and search system logs across all modules
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <SystemLogFilters
            modules={modules}
            events={events}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            moduleFilter={moduleFilter}
            eventFilter={eventFilter}
            searchQuery={searchQuery}
            selectedDate={selectedDate}
          />
          
          {/* Logs Table */}
          <div className="rounded-md border">
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Time</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Module</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Event</th> 
                    <th className="h-12 px-4 text-left align-middle font-medium">Level</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No logs found. Try adjusting your filters.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="p-4 align-middle">
                          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                        </td>
                        <td className="p-4 align-middle">{log.module}</td>
                        <td className="p-4 align-middle">{log.type}</td>
                        <td className="p-4 align-middle capitalize">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              log.level === 'error'
                                ? 'bg-red-100 text-red-800'
                                : log.level === 'warn'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td className="p-4 align-middle truncate max-w-xs">
                          {log.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleCheck(SystemLogs, { roles: ['admin', 'owner'] });
