import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RefreshCw, Filter } from "lucide-react";
import { LogFilters } from "@/types/logs";

interface ErrorMonitoringFiltersProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  isLoading: boolean;
  onRefresh?: () => void;
}

const ErrorMonitoringFilters: React.FC<ErrorMonitoringFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading,
  onRefresh,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleSeverityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      severity: value !== "all" ? [value] : undefined,
    });
  };

  const handleModuleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      module: value !== "all" ? [value] : undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative w-full sm:w-64">
        <Input
          placeholder="Search errors..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="pl-8"
          disabled={isLoading}
        />
        <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <Select
        value={
          Array.isArray(filters.severity) && filters.severity.length > 0
            ? filters.severity[0]
            : "all"
        }
        onValueChange={handleSeverityChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={
          Array.isArray(filters.module) && filters.module.length > 0
            ? filters.module[0]
            : "all"
        }
        onValueChange={handleModuleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Module" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modules</SelectItem>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="api">API</SelectItem>
          <SelectItem value="database">Database</SelectItem>
          <SelectItem value="auth">Authentication</SelectItem>
          <SelectItem value="strategy">Strategy</SelectItem>
        </SelectContent>
      </Select>

      {onRefresh && (
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="ml-auto h-9 w-9"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      )}
    </div>
  );
};

export default ErrorMonitoringFilters;
