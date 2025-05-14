
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GraphNode } from '@/types/galaxy';
import InspectorContent from './InspectorContent';
import { getNodeTitle, getNodeType } from './node-inspectors/NodeUtilities';

interface MobileInspectorProps {
  node: GraphNode;
  onClose: () => void;
}

const MobileInspector: React.FC<MobileInspectorProps> = ({ node, onClose }) => {
  if (!node) return null;
  
  return (
    <Sheet open={!!node} onOpenChange={() => onClose()}>
      <SheetContent side="bottom" className="h-[80vh] px-0">
        <div className="h-1 w-12 bg-muted-foreground/10 rounded-full mx-auto mb-2" />
        <SheetHeader className="flex-row justify-between items-center mb-4 px-4">
          <SheetTitle>{getNodeTitle(node)}</SheetTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <div className="space-y-2 px-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full">
              {getNodeType(node)}
            </span>
            {node.status && (
              <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full">
                {node.status}
              </span>
            )}
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <div className="px-4 overflow-y-auto max-h-[calc(80vh-140px)] pr-4 space-y-6">
            <InspectorContent node={node} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileInspector;
