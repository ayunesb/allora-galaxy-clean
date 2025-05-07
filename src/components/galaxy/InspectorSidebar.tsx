
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { InspectorContent } from "./InspectorContent";
import { getNodeTitle, getNodeType } from "./node-inspectors/NodeUtilities";

interface InspectorSidebarProps {
  node: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  node,
  open,
  onOpenChange,
}) => {
  if (!node) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-lg overflow-auto">
        <SheetHeader>
          <SheetTitle>{getNodeTitle(node)}</SheetTitle>
          <SheetDescription>
            {getNodeType(node)} {node.id && `ID: ${node.id.substring(0, 8)}...`}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <InspectorContent node={node} />
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Export InspectorContent separately for mobile use in GalaxyExplorer
export { InspectorContent };

export default InspectorSidebar;
