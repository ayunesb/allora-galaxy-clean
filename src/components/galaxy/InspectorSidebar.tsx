
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { GraphNode } from '@/types/galaxy';
import { InspectorContent } from './InspectorContent';

export interface InspectorSidebarProps {
  node: GraphNode;
  onClose: () => void;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ node, onClose }) => {
  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-background border-l border-border shadow-lg overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{node.name || node.title || 'Node Details'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <InspectorContent node={node} />
      </div>
    </div>
  );
};
