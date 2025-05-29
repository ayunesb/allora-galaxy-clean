import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { StrategyStatusBadge } from "./StrategyStatusBadge";
import { Strategy } from "@/types";

interface StrategyHeaderProps {
  status: Strategy["status"];
  onBack: () => void;
}

export const StrategyHeader: React.FC<StrategyHeaderProps> = ({
  status,
  onBack,
}) => {
  return (
    <div className="flex justify-between items-center">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ChevronLeft className="h-4 w-4" />
        Back to Strategies
      </Button>

      <StrategyStatusBadge status={status} />
    </div>
  );
};

export default StrategyHeader;
