
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SystemLog } from '@/types/logs';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import AuditLogFilters, { AuditLogFilter } from '@/components/evolution/logs/AuditLogFilters';
import { RefreshCw, Search } from 'lucide-react';

interface AuditLogProps {
  resourceId?: string;
  resourceType?: string;
  limit?: number;
  title?: string;
  description?: string;
  showFilters?: boolean;
  moduleFilter?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({ 
  resourceId,
  resourceType,
  limit = 25,
  title = 'Audit Log',
  description,
  showFilters = true,
  moduleFilter
}) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilter>({});
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply resource filters if provided
      if (resourceId) {
        query = query.eq('context->resource_id', resourceId);
      }
      
      if (resourceType) {
        query = query.eq('context->resource_type', resourceType);
      }
      
      // Apply user filters
      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.module || moduleFilter) {
        query = query.eq('module', filters.module || moduleFilter);
      }
      
      if (filters.dateRange?.from) {
        const fromDate = format(filters.dateRange.from, 'yyyy-MM-dd');
        query = query.gte('created_at', `${fromDate}T00:00:00`);
      }
      
      if (filters.dateRange?.to) {
        const toDate = format(filters.dateRange.to, 'yyyy-MM-dd');
        query = query.lte('created_at', `${toDate}T23:59:59`);
      }
      
      const { data, error } = await query.limit(limit);
      
      if (error) throw error;
      setLogs(data || []);
      
      // Fetch unique modules if needed
      if (!modules.length) {
        const { data: modulesData } = await supabase
          .from('system_logs')
          .select('module')
          .is('module', 'not.null');
        
        if (modulesData) {
          const uniqueModules = Array.from(new Set(
            modulesData.map(item => item.module)
          )).filter(Boolean);
          setModules(uniqueModules);
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [resourceId, resourceType, filters, limit, moduleFilter]);

  const handleFilterChange = (newFilters: AuditLogFilter) => {
    setFilters(newFilters);
  };
  
  const handleLogClick = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const getStatusVariant = (event: string): "default" | "secondary" | "destructive" | "outline" => {
    if (event.includes('error') || event.includes('failed')) {
      return 'destructive';
    } else if (event.includes('warning')) {
      return 'secondary';
    } else if (event.includes('success') || event.includes('completed')) {
      return 'default';
    }
    return 'outline';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <Button variant="outline" size="icon" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <AuditLogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            modules={modules}
          />
        )}
        
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No log entries found</p>
            <p className="text-xs text-muted-foreground/70">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer" onClick={() => handleLogClick(log)}>
                    <TableCell>
                      <Badge variant={getStatusVariant(log.event)}>
                        {log.module}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.event}</TableCell>
                    <TableCell>{format(new Date(log.created_at), 'dd MMM, HH:mm')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <LogDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          log={selectedLog}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
