
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GraphNode } from '@/types/galaxy';

interface InspectorSidebarProps {
  node: GraphNode;
  onClose: () => void;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ 
  node, 
  onClose 
}) => {
  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-background border-l border-border transition-all z-10">
      <Card className="h-full rounded-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Node Details
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                <p className="text-sm text-muted-foreground">{node.description}</p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-1">Metadata</h4>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(node.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
