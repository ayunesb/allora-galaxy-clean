
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatNodeMetadata, getNodeStatusVariant } from './NodeUtilities';
import { GraphNode } from '@/types/galaxy';

interface StrategyInspectorProps {
  node: GraphNode;
}

export const StrategyInspector: React.FC<StrategyInspectorProps> = ({ node }) => {
  const metadata = formatNodeMetadata(node.metadata);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{node.name || 'Strategy'}</CardTitle>
          <Badge variant={getNodeStatusVariant(node)}>
            {node.status || 'Unknown'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {node.description || 'No description available'}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {node.version && (
          <div>
            <h4 className="text-sm font-medium mb-1">Version</h4>
            <p className="text-sm">{node.version}</p>
          </div>
        )}
        
        {node.last_executed && (
          <div>
            <h4 className="text-sm font-medium mb-1">Last Executed</h4>
            <p className="text-sm">{new Date(node.last_executed).toLocaleString()}</p>
          </div>
        )}
        
        {Object.keys(metadata).length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Strategy Details</h4>
              <div className="space-y-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{key}</span>
                    <span className="text-xs col-span-2 break-words">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyInspector;
