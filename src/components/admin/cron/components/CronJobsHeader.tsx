
import React from 'react';
import { RotateCw } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CronJobsHeaderProps {
  timeRange: '24h' | '7d' | '30d' | 'all';
  isLoading: boolean;
  onTimeRangeChange: (value: '24h' | '7d' | '30d' | 'all') => void;
  onRefresh: () => void;
}

export const CronJobsHeader: React.FC<CronJobsHeaderProps> = ({
  timeRange,
  isLoading,
  onTimeRangeChange,
  onRefresh
}) => (
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>CRON Jobs Monitoring</CardTitle>
      <CardDescription>Monitor and manage scheduled background tasks</CardDescription>
    </div>
    <div className="flex space-x-2">
      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="24h">Last 24 hours</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
        <RotateCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>
  </CardHeader>
);
