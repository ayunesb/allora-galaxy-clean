
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CronJobsHeaderProps {
  timeRange: string;
  isLoading: boolean;
  onTimeRangeChange: (value: string) => void;
  onRefresh: () => void;
}

export const CronJobsHeader: React.FC<CronJobsHeaderProps> = ({
  timeRange,
  isLoading,
  onTimeRangeChange,
  onRefresh
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xl font-semibold">CRON Jobs Monitoring</CardTitle>
      <div className="flex items-center space-x-2">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last hour</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </CardHeader>
  );
};

export default CronJobsHeader;
