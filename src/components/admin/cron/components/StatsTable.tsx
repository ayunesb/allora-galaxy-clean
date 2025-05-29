import React from "react";
import {
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface CronJobStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  completed: number;
}

interface StatsTableProps {
  stats: CronJobStats;
  isLoading: boolean;
}

export const StatsTable: React.FC<StatsTableProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead>Count</TableHead>
          <TableHead>Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Total Jobs</TableCell>
          <TableCell>{stats.total}</TableCell>
          <TableCell>100%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Active Jobs</TableCell>
          <TableCell>{stats.active}</TableCell>
          <TableCell>
            {stats.total > 0
              ? Math.round((stats.active / stats.total) * 100)
              : 0}
            %
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Pending Jobs</TableCell>
          <TableCell>{stats.pending}</TableCell>
          <TableCell>
            {stats.total > 0
              ? Math.round((stats.pending / stats.total) * 100)
              : 0}
            %
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Failed Jobs</TableCell>
          <TableCell>{stats.failed}</TableCell>
          <TableCell>
            {stats.total > 0
              ? Math.round((stats.failed / stats.total) * 100)
              : 0}
            %
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Completed Jobs</TableCell>
          <TableCell>{stats.completed}</TableCell>
          <TableCell>
            {stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0}
            %
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default StatsTable;
