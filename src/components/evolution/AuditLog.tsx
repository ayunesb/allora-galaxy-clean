
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuditLog as AuditLogType } from '@/types/logs';
import LogDetailDialog from './logs/LogDetailDialog';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import AuditLogFilters, { AuditLogFilters as AuditLogFiltersType } from './logs/AuditLogFilters';
import { SystemEventModule } from '@/types/logs';

export interface AuditLogProps {
  title: string;
  data: AuditLogType[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const AuditLog: React.FC<AuditLogProps> = ({ 
  title, 
  data, 
  isLoading = false,
  onRefresh
}) => {
  const [open, setOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [filters, setFilters] = useState<AuditLogFiltersType>({ searchTerm: '' });

  const handleOpen = (log: AuditLogType) => {
    setSelectedLog(log);
    setOpen(true);
  };

  const handleFilterChange = (newFilters: AuditLogFiltersType) => {
    setFilters(newFilters);
  };

  const filteredLogs = data.filter(log => {
    const searchTermLower = filters.searchTerm.toLowerCase();
    const matchesSearchTerm =
      log.event.toLowerCase().includes(searchTermLower) ||
      log.module.toLowerCase().includes(searchTermLower) ||
      (log.description && log.description.toLowerCase().includes(searchTermLower));

    const matchesModule = !filters.module || log.module === filters.module;
    
    const matchesDateRange = !filters.dateRange?.from || (
      new Date(log.created_at) >= filters.dateRange.from &&
      (!filters.dateRange.to || new Date(log.created_at) <= filters.dateRange.to)
    );

    return matchesSearchTerm && matchesModule && matchesDateRange;
  });

  const modules: SystemEventModule[] = Array.from(new Set(data.map(log => log.module))) as SystemEventModule[];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <AuditLogFilters 
            onFilterChange={handleFilterChange}
            modules={modules}
          />
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px] w-full overflow-auto">
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-12 items-center gap-4 p-4 hover:bg-secondary"
                onClick={() => handleOpen(log)}
                style={{ cursor: 'pointer' }}
              >
                <div className="col-span-2 text-xs text-muted-foreground">
                  {format(new Date(log.created_at), 'MMM dd, yyyy hh:mm:ss')}
                </div>
                <div className="col-span-2">
                  <Badge variant="secondary">{log.module}</Badge>
                </div>
                <div className="col-span-8">{log.event}</div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No logs found.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <LogDetailDialog log={selectedLog} open={open} onOpenChange={setOpen} />
    </Card>
  );
};

export default AuditLog;
