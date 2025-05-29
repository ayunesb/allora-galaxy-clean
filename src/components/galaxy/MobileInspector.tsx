import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphNode } from "@/types/galaxy";

interface MobileInspectorProps {
  node: GraphNode;
  onClose: () => void;
}

const MobileInspector: React.FC<MobileInspectorProps> = ({ node, onClose }) => {
  return (
    <Sheet open={!!node} onOpenChange={() => onClose()}>
      <SheetContent side="bottom" className="h-[80vh]">
        <div className="h-1 w-12 bg-muted-foreground/10 rounded-full mx-auto mb-2" />
        <SheetHeader className="flex-row justify-between items-center mb-4">
          <SheetTitle>Node Details</SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-80px)] pr-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{node.name || node.id}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full">
                {node.type}
              </span>
              {node.status && (
                <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full">
                  {node.status}
                </span>
              )}
            </div>
          </div>

          {node.description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">
                {node.description}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-1">Metadata</h4>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(node.metadata || {}, null, 2)}
            </pre>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileInspector;
