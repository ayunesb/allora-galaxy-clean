
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GraphNode } from '@/types/galaxy';
import { InspectorContent } from './InspectorContent';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface MobileInspectorProps {
  node: GraphNode | null;
  onClose: () => void;
}

/**
 * Mobile version of inspector that shows as a bottom sheet
 */
const MobileInspector: React.FC<MobileInspectorProps> = ({ node, onClose }) => {
  if (!node) return null;
  
  return (
    <Sheet open={!!node} onOpenChange={open => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="flex flex-row justify-between items-center">
          <SheetTitle>{node.name || node.title || 'Node Details'}</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <div className="mt-4">
          <InspectorContent node={node} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileInspector;
