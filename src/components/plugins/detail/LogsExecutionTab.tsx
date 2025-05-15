
import React from 'react';
import { ScatterPlot, ScatterDataPoint, ExecutionEmptyState } from '@/components/plugins/execution';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AreaChart, Clock, Activity } from 'lucide-react';

interface LogsExecutionTabProps {
  executionData: ScatterDataPoint[];
}

export const LogsExecutionTab: React.FC<LogsExecutionTabProps> = ({ executionData }) => {
  const executionStats = React.useMemo(() => {
    if (executionData.length === 0) return { total: 0, avgTime: 0, totalXp: 0 };
    
    const total = executionData.length;
    const totalXp = executionData.reduce((sum, data) => sum + data.xp_earned, 0);
    const totalTime = executionData.reduce((sum, data) => sum + data.execution_time, 0);
    const avgTime = totalTime / total;
    
    return { total, avgTime: avgTime.toFixed(2), totalXp };
  }, [executionData]);
  
  if (executionData.length === 0) {
    return <ExecutionEmptyState />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden border transition-all hover:shadow-md">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            Execution Performance
          </CardTitle>
          <CardDescription>
            Visual representation of execution time vs. XP earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-muted/30 p-4 rounded-md hover:bg-muted/50 transition-colors flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Average Time</p>
                <p className="text-xl font-semibold">{executionStats.avgTime}s</p>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md hover:bg-muted/50 transition-colors flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <AreaChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Executions</p>
                <p className="text-xl font-semibold">{executionStats.total}</p>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md hover:bg-muted/50 transition-colors flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total XP Earned</p>
                <p className="text-xl font-semibold">{executionStats.totalXp}</p>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] mt-6 border rounded-md p-4">
            <ScatterPlot data={executionData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsExecutionTab;
