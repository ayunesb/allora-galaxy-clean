import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRange } from 'react-day-picker';
import { Search, Filter } from 'lucide-react';
import { SystemLog } from '@/types/logs';
import { EvolutionFilter } from '@/types/evolution';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { LogDetailDialog } from './LogDetailDialog';
import { Pagination } from '@/components/ui/pagination';
import { formatDistanceToNow } from 'date-fns';

export interface AuditLogProps {
  onFetchData: (filters: any) => Promise<SystemLog[]>;
}

const LOGS_PER_PAGE = 10;

const AuditLog: React.FC<AuditLogProps> = ({ onFetchData }) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalLogs / LOGS_PER_PAGE));

  // Fetch data with new filters
  const fetchData = async (newFilters = filters, page = currentPage) => {
    setLoading(true);
    try {
      // In a real app, pagination would be server-side
      // For now, we'll simulate it by slicing client-side
      const results = await onFetchData(newFilters);
      
      setTotalLogs(results.length);
      
      // Calculate pagination slice
      const startIndex = (page - 1) * LOGS_PER_PAGE;
      const endIndex = startIndex + LOGS_PER_PAGE;
      setLogs(results.slice(startIndex, endIndex));
      
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchData(newFilters, 1);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(filters, page);
  };

  // View log details
  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setShowDetailDialog(true);
  };

  // Get badge variant based on module
  const getModuleBadgeVariant = (module: string) => {
    switch (module?.toLowerCase()) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'strategy':
        return 'default';
      case 'plugin':
        return 'secondary';
      case 'auth':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Initial data fetch
  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>System Activity</CardTitle>
        <CardDescription>
          View and filter system logs and activity records
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <AuditLogFilters onFilterChange={handleFilterChange} />
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Event</th>
                    <th className="px-4 py-3 text-left font-medium">Module</th>
                    <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Time</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>{log.event}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getModuleBadgeVariant(log.module)}>
                          {log.module}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetails(log)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{Math.min((currentPage - 1) * LOGS_PER_PAGE + 1, totalLogs)}</strong> to{" "}
                <strong>{Math.min(currentPage * LOGS_PER_PAGE, totalLogs)}</strong> of{" "}
                <strong>{totalLogs}</strong> logs
              </div>
              <div className="flex justify-center mt-6">
                <nav aria-label="Pagination">
                  <ul className="flex space-x-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li key={i}>
                        <Button
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(i + 1)}
                          className="w-10 h-10"
                        >
                          {i + 1}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="text-muted-foreground">No logs found</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setFilters({});
                fetchData({}, 1);
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        )}
        
        {selectedLog && (
          <LogDetailDialog
            log={selectedLog}
            open={showDetailDialog}
            onClose={() => setShowDetailDialog(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLog;
