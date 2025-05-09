
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogFilters } from "./logs/AuditLogFilters";
import { AuditLogTable } from "./logs/AuditLogTable";
import { LogDetailDialog } from "./logs/LogDetailDialog";
import { AuditLog as AuditLogType } from "@/types/shared";

export interface AuditLogProps {
  title?: string;
  logs: AuditLogType[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

function AuditLog({ title = "Audit Logs", logs, isLoading = false, onRefresh }: AuditLogProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    module: null as string | null,
    eventType: null as string | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      module: null,
      eventType: null,
      startDate: null,
      endDate: null,
    });
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleViewDetails = (log: AuditLogType) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const filteredLogs = logs.filter((log) => {
    // Filter by search term
    if (filters.search && !JSON.stringify(log).toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Filter by module
    if (filters.module && log.module !== filters.module) {
      return false;
    }

    // Filter by event type
    if (filters.eventType && log.event_type !== filters.eventType) {
      return false;
    }

    // Filter by start date
    if (filters.startDate && new Date(log.created_at) < filters.startDate) {
      return false;
    }

    // Filter by end date
    if (filters.endDate) {
      const endDateWithTime = new Date(filters.endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (new Date(log.created_at) > endDateWithTime) {
        return false;
      }
    }

    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AuditLogFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onRefresh={handleRefresh}
        />
        <div className="mt-4">
          <AuditLogTable 
            logs={filteredLogs} 
            isLoading={isLoading} 
            onViewDetails={handleViewDetails} 
          />
        </div>
        
        <LogDetailDialog 
          log={selectedLog} 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)} 
        />
      </CardContent>
    </Card>
  );
}

export default AuditLog;
