import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { GraphNode } from "@/types/galaxy";

interface InspectorContentProps {
  node: GraphNode | null;
  onClose: () => void;
}

const InspectorContent: React.FC<InspectorContentProps> = ({ node, onClose }) => {
  if (!node) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Node Selected</CardTitle>
        </CardHeader>
        <CardContent>
          Select a node to view details.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{node.label}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>Type: {node.type}</p>
        {node.description && <p>Description: {node.description}</p>}
        {node.status && <p>Status: {node.status}</p>}
        {/* Add more details here based on the node type */}
      </CardContent>
    </Card>
  );
};

export default InspectorContent;
