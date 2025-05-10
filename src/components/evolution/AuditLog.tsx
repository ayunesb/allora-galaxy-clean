
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import AuditLogFilters, { AuditLogFilters as AuditLogFiltersType } from './logs/AuditLogFilters';
import AuditLogTable, { AuditLog as AuditLogType } from './logs/AuditLogTable';
import LogDetailDialog from './logs/LogDetailDialog';
import useAuditLogData from '@/hooks/admin/useAuditLogData';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditLogProps {
  limitEntries?: boolean;
  showHeader?: boolean;
  title?: string;
  description?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({
  limitEntries = false,
  showHeader = true,
  title = "Audit Logs",
  description = "Review all system actions and changes"
}) => {
  const [filters, setFilters] = useState<AuditLogFiltersType>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { logs, isLoading, error, handleRefresh } = useAuditLogData(filters);

  const displayLogs = useMemo(() => {
    if (limitEntries && logs.length > 5) {
      return logs.slice(0, 5);
    }
    return logs;
  }, [logs, limitEntries]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleRowClick = (log: AuditLogType) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
  };

  return (
    <Card className="w-full">
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh
          </Button>
        </CardHeader>
      )}
      <CardContent>
        <AuditLogFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>Error loading audit logs: {error.message}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        ) : (
          <AuditLogTable 
            logs={displayLogs} 
            onRowClick={handleRowClick} 
          />
        )}
        
        {limitEntries && logs.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="link">View All Logs</Button>
          </div>
        )}
      </CardContent>

      <LogDetailDialog 
        log={selectedLog} 
        open={dialogOpen} 
        onOpenChange={handleDialogOpenChange} 
      />
    </Card>
  );
};

export default AuditLog;
