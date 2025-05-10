
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play as PlayIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  status: string;
  error_message: string | null;
  function_name?: string;
  created_at?: string;
  duration_ms?: number | null;
  metadata?: Record<string, any> | null;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  completed: number;
}

export interface CronJobsTabsProps {
  jobs: CronJob[];
  stats: Stats;
  isLoading: boolean;
  onRunJob: (jobId: string) => void;
}

export const CronJobsTabs: React.FC<CronJobsTabsProps> = ({
  jobs,
  stats,
  isLoading,
  onRunJob
}) => {
  return (
    <Tabs defaultValue="jobs" className="w-full">
      <TabsList>
        <TabsTrigger value="jobs">Jobs List</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="jobs" className="py-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No scheduled jobs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Job Name</th>
                  <th className="px-4 py-2 text-left">Schedule</th>
                  <th className="px-4 py-2 text-left">Last Run</th>
                  <th className="px-4 py-2 text-left">Next Run</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2">{job.name}</td>
                    <td className="px-4 py-2">{job.schedule}</td>
                    <td className="px-4 py-2">{job.last_run || 'Never'}</td>
                    <td className="px-4 py-2">{job.next_run}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={job.status} errorMessage={job.error_message} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => onRunJob(job.id)}
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="stats" className="py-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card shadow-sm rounded-lg p-4 text-center">
              <h3 className="text-muted-foreground text-sm">Total Jobs</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-card shadow-sm rounded-lg p-4 text-center">
              <h3 className="text-muted-foreground text-sm">Active</h3>
              <p className="text-3xl font-bold text-green-500">{stats.active}</p>
            </div>
            <div className="bg-card shadow-sm rounded-lg p-4 text-center">
              <h3 className="text-muted-foreground text-sm">Pending</h3>
              <p className="text-3xl font-bold text-blue-500">{stats.pending}</p>
            </div>
            <div className="bg-card shadow-sm rounded-lg p-4 text-center">
              <h3 className="text-muted-foreground text-sm">Failed</h3>
              <p className="text-3xl font-bold text-red-500">{stats.failed}</p>
            </div>
            <div className="bg-card shadow-sm rounded-lg p-4 text-center">
              <h3 className="text-muted-foreground text-sm">Completed</h3>
              <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CronJobsTabs;
