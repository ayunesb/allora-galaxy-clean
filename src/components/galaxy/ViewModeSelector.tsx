import React from "react";
import { Button } from "@/components/ui/button";

export interface ViewModeSelectorProps {
  viewMode: string;
  onModeChange: (mode: string) => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onModeChange,
}) => {
  const modes = [
    { id: "strategy", label: "Strategy" },
    { id: "plugin", label: "Plugin" },
    { id: "agent", label: "Agent" },
  ];

  return (
    <div className="flex space-x-1 bg-secondary rounded-md p-1">
      {modes.map((mode) => (
        <Button
          key={mode.id}
          variant={viewMode === mode.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange(mode.id)}
          className="text-xs"
        >
          {mode.label}
        </Button>
      ))}
    </div>
  );
};

export default ViewModeSelector;
