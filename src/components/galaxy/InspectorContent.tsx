
import React from 'react';
import { GraphNode } from "@/types/galaxy";

interface InspectorContentProps {
  node: GraphNode | null;
}

export const InspectorContent: React.FC<InspectorContentProps> = ({ node }) => {
  if (!node) {
    return (
      <div className="py-2">
        <p className="text-muted-foreground text-sm">Select a node to view details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {node.description && (
        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-muted-foreground">{node.description}</p>
        </div>
      )}
      
      {node.status && (
        <div>
          <h4 className="text-sm font-medium mb-1">Status</h4>
          <p className="text-sm text-muted-foreground">{node.status}</p>
        </div>
      )}
      
      {node.metadata && (
        <div>
          <h4 className="text-sm font-medium mb-1">Metadata</h4>
          <div className="text-xs bg-muted p-2 rounded overflow-x-auto">
            <pre>{JSON.stringify(node.metadata, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {/* Additional fields based on node type can be added here */}
    </div>
  );
};

export default InspectorContent;
