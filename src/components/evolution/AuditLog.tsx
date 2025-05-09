
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogFilters } from "./logs/AuditLogFilters";
import { AuditLogTable } from "./logs/AuditLogTable";

export interface AuditLogProps {
  title?: string;
  logs: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

function AuditLog({ title = "Audit Logs", logs, isLoading = false, onRefresh }: AuditLogProps) {
  const [filters, setFilters] = useState({
    search: "",
    module: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      module: "",
      startDate: null,
      endDate: null,
    });
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
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
        <AuditLogTable logs={filteredLogs} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

export default AuditLog;
