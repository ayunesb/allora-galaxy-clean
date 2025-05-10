
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the Stats interface for the component
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
    return <StatsSkeleton />;
  }

  const statItems = [
    { label: 'Total Jobs', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Pending', value: stats.pending },
    { label: 'Failed', value: stats.failed },
    { label: 'Completed', value: stats.completed },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statItems.map((item) => (
              <TableRow key={item.label}>
                <TableCell>{item.label}</TableCell>
                <TableCell className="text-right font-medium">{item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const StatsSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
  </div>
);
