import React from "react";
import { ViewModeSelector } from "@/components/galaxy/ViewModeSelector";
import ZoomControls from "@/components/galaxy/ZoomControls";

interface GalaxyControlsProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
  onCenter: () => void;
}

const GalaxyControls: React.FC<GalaxyControlsProps> = ({
  viewMode,
  setViewMode,
  onZoomIn,
  onZoomOut,
  onRefresh,
  onCenter,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-6 gap-4">
      <ViewModeSelector viewMode={viewMode} onModeChange={setViewMode} />
      <ZoomControls
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onRefresh={onRefresh}
        onCenter={onCenter}
      />
    </div>
  );
};

export default GalaxyControls;
