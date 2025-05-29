import React, { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import StrategyLoadingSkeleton from "@/components/evolution/strategy/StrategyLoadingSkeleton";
import EvolutionHistory from "@/components/evolution/strategy/EvolutionHistory";
import ExecutionLogs from "@/components/evolution/strategy/ExecutionLogs";
import StrategyDetails from "@/components/evolution/strategy/StrategyDetails";
import LogDetailDialog from "@/components/admin/logs/LogDetailDialog";
import useOptimizedStrategyData from "@/hooks/useOptimizedStrategyData";
import { OptimizedAsyncDataRenderer } from "@/components/ui/optimized-async-data-renderer";
import { toast } from "@/lib/notifications/toast";
import type { SystemLog } from "@/types/logs";

interface StrategyEvolutionTabProps {
  strategyId: string;
}

const StrategyEvolutionTab: React.FC<StrategyEvolutionTabProps> = ({
  strategyId,
}) => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  const { strategy, versions, executions, refetch, isLoading, isError } =
    useOptimizedStrategyData(strategyId);

  // Handle refresh button click
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      toast.error({
        title: "Refresh failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, [refetch]);

  // Close log detail dialog
  const handleCloseLogDetail = useCallback(() => {
    setSelectedLog(null);
  }, []);

  // View execution details
  const handleViewExecution = useCallback((execution: any) => {
    // Convert execution to system log format for viewing in detail dialog
    const log: SystemLog = {
      id: execution.id,
      created_at: execution.created_at,
      timestamp: execution.start_time,
      description: `Execution ${execution.status}`,
      message: execution.error || `Strategy execution ${execution.status}`,
      level: execution.error
        ? "error"
        : execution.status === "completed"
          ? "info"
          : "warning",
      module: "strategy",
      tenant_id: "",
      metadata: {
        executionId: execution.id,
        parameters: execution.parameters,
        result: execution.result,
        duration: execution.duration_ms,
      },
      severity: execution.error ? "high" : "low",
      priority: execution.error ? "high" : "low",
      event: execution.status,
      event_type: execution.status,
      context: {},
      user_facing: false,
      affects_multiple_users: false,
    };

    setSelectedLog(log);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Strategy Evolution</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <OptimizedAsyncDataRenderer
        data={strategy.data}
        isLoading={strategy.isLoading}
        error={strategy.error instanceof Error ? strategy.error : null}
        onRetry={refetch}
      >
        {(strategyData) => <StrategyDetails strategy={strategyData} />}
      </OptimizedAsyncDataRenderer>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Version History</TabsTrigger>
          <TabsTrigger value="executions">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <OptimizedAsyncDataRenderer
            data={versions.data}
            isLoading={versions.isLoading}
            error={versions.error instanceof Error ? versions.error : null}
            onRetry={refetch}
          >
            {(versionsData) => <EvolutionHistory versions={versionsData} />}
          </OptimizedAsyncDataRenderer>
        </TabsContent>

        <TabsContent value="executions">
          <OptimizedAsyncDataRenderer
            data={executions.data}
            isLoading={executions.isLoading}
            error={executions.error instanceof Error ? executions.error : null}
            onRetry={refetch}
            virtualize={true}
          >
            {(executionsData) => (
              <ExecutionLogs
                executions={executionsData}
                onViewDetails={handleViewExecution}
              />
            )}
          </OptimizedAsyncDataRenderer>
        </TabsContent>
      </Tabs>

      {/* Log detail dialog for viewing execution details */}
      <LogDetailDialog
        log={selectedLog}
        open={selectedLog !== null}
        onClose={handleCloseLogDetail}
      />
    </div>
  );
};

export default React.memo(StrategyEvolutionTab);
