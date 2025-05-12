
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface NodeData {
  id: string;
  group: string;
  label: string;
  value: number;
}

interface LinkData {
  source: string;
  target: string;
  value: number;
}

interface EvolutionGraphProps {
  nodes?: NodeData[];
  links?: LinkData[];
  isLoading?: boolean;
  title?: string;
  height?: string;
}

const EvolutionGraph: React.FC<EvolutionGraphProps> = ({ 
  nodes = [], 
  links = [], 
  isLoading = false,
  title = "Evolution Graph",
  height = "500px"
}) => {
  const [viewType, setViewType] = React.useState<'graph' | 'tree'>('graph');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No evolution data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'graph' | 'tree')}>
          <TabsList>
            <TabsTrigger value="graph">Force Graph</TabsTrigger>
            <TabsTrigger value="tree">Tree View</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div style={{ height, width: '100%', position: 'relative' }}>
          {viewType === 'graph' ? (
            <div className="w-full h-full border border-muted rounded-md">
              {/* For actual implementation, integrate react-force-graph-2d here */}
              <div className="flex items-center justify-center h-full bg-muted/10">
                <p className="text-muted-foreground">Graph visualization would render here</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full border border-muted rounded-md">
              {/* For actual implementation, integrate a tree visualization here */}
              <div className="flex items-center justify-center h-full bg-muted/10">
                <p className="text-muted-foreground">Tree visualization would render here</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolutionGraph;
