import React from "react";
import { Card } from "@/components/ui/card";
import { StrategyCardSkeleton } from "@/components/skeletons/StrategyCardSkeleton";

interface StrategiesGridProps {
  strategies: any[];
  isLoading: boolean;
  children?: React.ReactNode;
}

export const StrategiesGrid: React.FC<StrategiesGridProps> = ({
  strategies,
  isLoading,
  children,
}) => {
  // Show skeletons while loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <StrategyCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state when no strategies
  if (strategies.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No strategies available.</p>
      </Card>
    );
  }

  // Show actual strategies
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
};
