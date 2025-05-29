import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

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
  onRefresh,
}) => {
  return (
    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <CardTitle>CRON Jobs</CardTitle>
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 hours</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </CardHeader>
  );
};

export default CronJobsHeader;
