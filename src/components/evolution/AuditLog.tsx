
import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilterState } from '@/types/shared';
import { SystemLog } from '@/types/logs';
import AuditLogFilters from './logs/AuditLogFilters';
import LogDetailDialog from './logs/LogDetailDialog';
import { formatDistanceToNow } from 'date-fns';
import { Filter, RefreshCw } from 'lucide-react';

interface AuditLogProps {
  logs: SystemLog[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  onFilterChange?: (filter: FilterState) => void;
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'error':
      return 'destructive';
    case 'warn':
      return 'warning';
    case 'info':
      return 'secondary';
    case 'debug':
      return 'outline';
    default:
      return 'secondary';
  }
}

export default function AuditLog({
  logs,
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onRefresh,
  onFilterChange
}: AuditLogProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [filter, setFilter] = useState<FilterState>({});

  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
  };

  const handleApplyFilter = (newFilter: FilterState) => {
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
    setShowFilters(false);
  };

  const handleResetFilter = () => {
    const emptyFilter: FilterState = {};
    setFilter(emptyFilter);
    if (onFilterChange) {
      onFilterChange(emptyFilter);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">System Audit Log</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={toggleFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="px-6">
        {showFilters && (
          <div className="mb-4">
            <AuditLogFilters 
              initialFilter={filter} 
              onApply={handleApplyFilter} 
              onReset={handleResetFilter}
            />
          </div>
        )}
      </div>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="font-medium">{log.module}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm max-w-xs truncate">
                      {log.event}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge variant={getSeverityColor(log.severity) as any}>
                        {log.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(log)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No logs found. Try adjusting your filters.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange || (() => {})}
            />
          </div>
        )}
      </CardContent>

      <LogDetailDialog 
        isOpen={!!selectedLog} 
        onClose={handleCloseDetails} 
        log={selectedLog} 
      />
    </Card>
  );
}
