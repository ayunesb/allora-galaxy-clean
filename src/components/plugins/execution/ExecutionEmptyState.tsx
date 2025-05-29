import React from "react";
import { LineChart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * EmptyState component specific for plugin execution data
 */
export const ExecutionEmptyState: React.FC = () => {
  return (
    <EmptyState
      title="No execution data"
      description="This plugin has no execution history to show"
      icon={<LineChart className="h-12 w-12" />}
    />
  );
};
