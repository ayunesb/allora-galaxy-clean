
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCcw, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
  onCenter?: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  onRefresh,
  onCenter 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onZoomIn} title="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onZoomOut} title="Zoom Out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      {onCenter && (
        <Button variant="outline" size="icon" onClick={onCenter} title="Center Graph">
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}
      <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh Data">
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ZoomControls;
