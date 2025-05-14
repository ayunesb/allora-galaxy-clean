
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

// Define the CronJobExecution interface for the table
export interface CronJobExecution {
  id: string;
  name: string;
  schedule: string | null | undefined;
  last_run: string | null;
  next_run: string | null;
  status: 'active' | 'inactive' | 'running' | 'failed';
  function_name: string;
  created_at: string;
  error_message?: string | null | undefined;
  duration_ms?: number | null;
  metadata?: Record<string, any> | null;
}

interface ExecutionsTableProps {
  jobs: CronJobExecution[];
  isLoading: boolean;
  actionButton?: (job: CronJobExecution) => ReactNode;
}

export const ExecutionsTable: React.FC<ExecutionsTableProps> = ({ 
  jobs, 
  isLoading, 
  actionButton 
}) => {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (jobs.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No jobs found.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            {actionButton && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.name}</TableCell>
              <TableCell>{job.schedule || 'Manual'}</TableCell>
              <TableCell>
                {job.last_run ? new Date(job.last_run).toLocaleString() : 'Never'}
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell>
                {job.duration_ms !== null && job.duration_ms !== undefined
                  ? `${job.duration_ms}ms`
                  : 'N/A'}
              </TableCell>
              {actionButton && (
                <TableCell className="text-right">
                  {actionButton(job)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const TableSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
);
