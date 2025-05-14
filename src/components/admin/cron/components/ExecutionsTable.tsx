
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from './StatusBadge';
import { TableSkeleton } from './TableSkeletons';
import { CronJob } from '@/types/cron';

interface ExecutionsTableProps {
  jobs: CronJob[];
  isLoading: boolean;
  actionButton?: (job: CronJob) => React.ReactNode;
}

export const ExecutionsTable: React.FC<ExecutionsTableProps> = ({
  jobs,
  isLoading,
  actionButton,
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Status</TableHead>
            {actionButton && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={actionButton ? 6 : 5} rows={5} />
          ) : jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={actionButton ? 6 : 5} className="text-center py-6 text-muted-foreground">
                No CRON jobs found
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>{job.schedule || 'Manual'}</TableCell>
                <TableCell>{formatDate(job.last_run)}</TableCell>
                <TableCell>{formatDate(job.next_run)}</TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                {actionButton && (
                  <TableCell className="text-right">{actionButton(job)}</TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export type { CronJob };
export type { CronJobStat } from '@/types/cron';
