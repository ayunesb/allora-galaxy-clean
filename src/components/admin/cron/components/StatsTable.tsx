
import React from 'react';
import { format } from 'date-fns';
import { PlayCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface CronJobStats {
  job_name: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_ms: number | null;
  last_execution: string | null;
}

interface StatsTableProps { 
  stats: CronJobStats[]; 
  onRunJob: (jobName: string) => Promise<any>; 
}

export const StatsTable: React.FC<StatsTableProps> = ({ stats, onRunJob }) => (
  <div className="rounded-md border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Name</TableHead>
          <TableHead>Total Executions</TableHead>
          <TableHead>Success Rate</TableHead>
          <TableHead>Avg Duration</TableHead>
          <TableHead>Last Execution</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map((stat) => (
          <TableRow key={stat.job_name}>
            <TableCell className="font-medium">{stat.job_name}</TableCell>
            <TableCell>{stat.total_executions}</TableCell>
            <TableCell>
              {stat.total_executions > 0 ? (
                `${Math.round((stat.successful_executions / stat.total_executions) * 100)}%`
              ) : 'N/A'}
            </TableCell>
            <TableCell>
              {stat.avg_duration_ms ? `${(stat.avg_duration_ms / 1000).toFixed(2)}s` : 'N/A'}
            </TableCell>
            <TableCell>
              {stat.last_execution ? format(new Date(stat.last_execution), 'yyyy-MM-dd HH:mm:ss') : 'Never'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRunJob(stat.job_name)}
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
