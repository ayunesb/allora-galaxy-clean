
import React from 'react';
import { format } from 'date-fns';
import { PlayCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { CronJob } from '@/hooks/admin/useCronJobsMonitoring';

interface ExecutionsTableProps { 
  jobs: CronJob[]; 
  onRunJob: (jobName: string) => Promise<any>; 
}

export const ExecutionsTable: React.FC<ExecutionsTableProps> = ({ jobs, onRunJob }) => (
  <div className="rounded-md border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Execution Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.job_name}</TableCell>
            <TableCell>
              <StatusBadge status={job.status} errorMessage={job.error_message} />
            </TableCell>
            <TableCell>{format(new Date(job.execution_time), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
            <TableCell>
              {job.duration_ms ? `${(job.duration_ms / 1000).toFixed(2)}s` : 'In progress'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRunJob(job.job_name)}
                title="Run job now"
              >
                <PlayCircle className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
