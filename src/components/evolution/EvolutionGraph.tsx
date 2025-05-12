
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from '@/hooks/useTheme';

export interface GraphNode {
  id: string;
  name: string;
  type: 'strategy' | 'plugin' | 'agent';
  status?: string;
  color?: string;
  val?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value?: number;
}

export interface EvolutionGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
  title?: string;
  height?: number;
  width?: number;
}

const EvolutionGraph: React.FC<EvolutionGraphProps> = ({
  nodes = [],
  links = [],
  onNodeClick,
  title = 'Evolution Graph',
  height = 400,
  width = undefined
}) => {
  const { theme } = useTheme();
  const [viewType, setViewType] = useState<'2d' | '3d'>('2d');
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = (node: GraphNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const getNodeColor = (node: GraphNode) => {
    if (node.color) return node.color;
    
    switch (node.type) {
      case 'strategy':
        return '#3b82f6';
      case 'plugin':
        return '#10b981';
      case 'agent':
        return '#f97316';
      default:
        return '#6366f1';
    }
  };
  
  // Resize graph on container resize
  useEffect(() => {
    if (!graphRef.current) return;
    
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        graphRef.current.width(containerRef.current.clientWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [graphRef.current]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as '2d' | '3d')}>
            <TabsList>
              <TabsTrigger value="2d">2D View</TabsTrigger>
              <TabsTrigger value="3d" disabled>3D View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-0" ref={containerRef}>
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
            <p className="text-muted-foreground">No evolution data available</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={{ nodes, links }}
            nodeLabel="name"
            nodeColor={node => getNodeColor(node as GraphNode)}
            nodeVal={node => (node as GraphNode).val || 1}
            linkWidth={link => (link as GraphLink).value || 1}
            height={height}
            width={width}
            backgroundColor={theme === 'dark' ? '#1e1e2e' : '#ffffff'}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const { name, x, y } = node as GraphNode & { x?: number, y?: number };
              if (typeof x !== 'number' || typeof y !== 'number') return;
              
              const fontSize = 4;
              const label = name;
              
              // Draw node
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = getNodeColor(node as GraphNode);
              ctx.fill();
              
              // Draw label if zoomed in enough
              if (globalScale >= 1.2) {
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillStyle = theme === 'dark' ? 'white' : 'black';
                ctx.textAlign = 'center';
                ctx.fillText(label, x, y + 12);
              }
            }}
            onNodeClick={handleNodeClick}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EvolutionGraph;
