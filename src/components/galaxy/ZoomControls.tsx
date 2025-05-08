
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRefresh
}) => {
  return (
    <div className="flex space-x-1">
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        title="Reset View"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ZoomControls;
