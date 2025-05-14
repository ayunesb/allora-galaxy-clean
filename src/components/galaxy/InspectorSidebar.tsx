
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GraphNode } from '@/types/galaxy';
import { InspectorContent } from './InspectorContent';
import { getNodeTitle } from './node-inspectors/NodeUtilities';

interface InspectorSidebarProps {
  node: GraphNode;
  onClose: () => void;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ 
  node, 
  onClose 
}) => {
  if (!node) return null;
  
  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-background border-l border-border transition-all z-10">
      <Card className="h-full rounded-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {getNodeTitle(node)}
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
          <InspectorContent node={node} />
        </CardContent>
      </Card>
    </div>
  );
};
