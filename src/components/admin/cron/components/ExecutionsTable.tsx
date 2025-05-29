import React from "react";
import {
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export interface CronJobExecution {
  id: string;
  name: string;
  schedule?: string | null;
  last_run?: string | null;
  next_run?: string | null;
  status: "active" | "inactive" | "running" | "failed";
  function_name: string;
  created_at: string;
  error_message?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, any> | null;
}

interface ExecutionsTableProps {
  jobs: CronJobExecution[];
  isLoading: boolean;
  actionButton?: (job: CronJobExecution) => React.ReactNode;
}

export const ExecutionsTable: React.FC<ExecutionsTableProps> = ({
  jobs,
  isLoading,
  actionButton,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Helper to format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy HH:mm:ss") : "-";
  };

  // Helper to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Inactive
          </Badge>
        );
      case "running":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Running
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Status</TableHead>
            {actionButton && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={actionButton ? 6 : 5}
                className="text-center py-4 text-muted-foreground"
              >
                No CRON jobs found
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>{job.schedule || "-"}</TableCell>
                <TableCell>{formatDate(job.last_run)}</TableCell>
                <TableCell>{formatDate(job.next_run)}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                {actionButton && <TableCell>{actionButton(job)}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExecutionsTable;
