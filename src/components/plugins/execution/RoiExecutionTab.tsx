import React from "react";
import {
  ScatterPlot,
  ScatterDataPoint,
  ExecutionEmptyState,
} from "@/components/plugins/execution";

interface RoiExecutionTabProps {
  scatterData: ScatterDataPoint[];
}

/**
 * Plugin ROI execution tab that displays execution performance metrics
 */
const RoiExecutionTab: React.FC<RoiExecutionTabProps> = ({ scatterData }) => {
  if (scatterData.length === 0) {
    return <ExecutionEmptyState />;
  }

  return <ScatterPlot data={scatterData} />;
};

export { RoiExecutionTab };
export type { RoiExecutionTabProps, ScatterDataPoint };
export default RoiExecutionTab;
