
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useGalaxyData } from '@/hooks/useGalaxyData';
import EmptyState from '@/components/galaxy/EmptyState';
import ForceGraph from '@/components/galaxy/ForceGraph';
import { GraphData, GraphNode } from '@/types/galaxy';

interface GalaxyLoaderProps {
  viewMode: string;
  fgRef?: React.RefObject<any>;
  onNodeClick: (node: GraphNode) => void;
}

const GalaxyLoader: React.FC<GalaxyLoaderProps> = ({ 
  viewMode, 
  fgRef, 
  onNodeClick 
}) => {
  // Load data for the graph
  const { data: graphDataQuery, isLoading } = useGalaxyData();
  const [graphData, setGraphData] = React.useState<GraphData>({ nodes: [], links: [] });
  
  // Update graph data when API data changes or view mode changes
  React.useEffect(() => {
    if (graphDataQuery) {
      let filteredNodes = [...graphDataQuery.nodes];
      let filteredLinks = [...graphDataQuery.links];
      
      // Apply view mode filter
      if (viewMode !== 'all') {
        filteredNodes = graphDataQuery.nodes.filter(node => node.type === viewMode);
        
        // Only include links where both source and target nodes are in the filtered set
        const nodeIds = new Set(filteredNodes.map(n => String(n.id)));
        
        filteredLinks = graphDataQuery.links.filter(link => {
          const sourceId = typeof link.source === 'object' ? 
            (link.source && (link.source as any).id ? String((link.source as any).id) : '') : 
            String(link.source || '');
            
          const targetId = typeof link.target === 'object' ? 
            (link.target && (link.target as any).id ? String((link.target as any).id) : '') : 
            String(link.target || '');
            
          return nodeIds.has(sourceId) && nodeIds.has(targetId);
        });
      }
      
      // Add color coding for approved strategies
      filteredNodes = filteredNodes.map(node => {
        // If this is a strategy node, color it based on approval status
        if (node.type === 'strategy') {
          if (node.status === 'approved') {
            return { 
              ...node, 
              color: '#10b981', // green for approved 
              borderColor: '#047857'
            };
          } else if (node.status === 'pending') {
            return { 
              ...node, 
              color: '#f59e0b', // amber for pending
              borderColor: '#d97706' 
            };
          }
        }
        return node;
      });
      
      setGraphData({ nodes: filteredNodes, links: filteredLinks });
    }
  }, [graphDataQuery, viewMode]);

  return (
    <Card className="overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : graphData.nodes.length === 0 ? (
        <EmptyState />
      ) : (
        <ForceGraph 
          graphData={graphData} 
          onNodeClick={onNodeClick}
          ref={fgRef}
        />
      )}
    </Card>
  );
};

export default GalaxyLoader;
export { type GalaxyLoaderProps };
