
import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { GraphNode } from '@/types/galaxy';
import { InspectorContent } from '@/components/galaxy/InspectorSidebar';

interface MobileInspectorProps {
  selectedNode: GraphNode | null;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

const MobileInspector: React.FC<MobileInspectorProps> = ({ 
  selectedNode, 
  showSidebar, 
  setShowSidebar 
}) => {
  return (
    <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-lg">
        {selectedNode && (
          <div className="pt-4">
            <h2 className="text-xl font-bold mb-4">{selectedNode.name || selectedNode.title || 'Details'}</h2>
            <InspectorContent node={selectedNode} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileInspector;
