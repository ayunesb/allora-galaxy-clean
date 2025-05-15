
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { RoiExecutionTab } from '@/components/plugins/execution';
import { ScatterDataPoint } from '@/components/plugins/execution/ScatterPlot';

interface LogsExecutionTabProps {
  executionData: ScatterDataPoint[];
}

export const LogsExecutionTab: React.FC<LogsExecutionTabProps> = ({ executionData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
        <CardDescription>
          Records of plugin execution and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RoiExecutionTab scatterData={executionData} />
      </CardContent>
    </Card>
  );
};

export default LogsExecutionTab;
