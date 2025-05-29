import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AgentPerformanceData } from "@/types/agent";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  ThumbsUp,
} from "lucide-react";

interface AgentPerformanceMetricsProps {
  metrics: AgentPerformanceData;
  className?: string;
}

export const AgentPerformanceMetrics: React.FC<
  AgentPerformanceMetricsProps
> = ({ metrics, className }) => {
  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Performance Metrics</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <span className="text-sm font-bold">
                {formatPercentage(metrics.successRate)}
              </span>
            </div>
            <Progress value={metrics.successRate * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              <span className="text-sm font-bold">
                {formatPercentage(metrics.errorRate)}
              </span>
            </div>
            <Progress value={metrics.errorRate * 100} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Avg. Execution Time</span>
            </div>
            <p className="text-xl font-bold">
              {metrics.averageExecutionTime.toFixed(2)}ms
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Avg. XP Earned</span>
            </div>
            <p className="text-xl font-bold">{metrics.averageXp.toFixed(1)}</p>
          </div>

          {metrics.upvoteRate !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Upvote Rate</span>
              </div>
              <p className="text-xl font-bold">
                {formatPercentage(metrics.upvoteRate)}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Total Executions</span>
            </div>
            <p className="text-xl font-bold">{metrics.totalExecutions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceMetrics;
