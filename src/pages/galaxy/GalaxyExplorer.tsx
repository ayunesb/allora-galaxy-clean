
import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import InspectorSidebar, { InspectorContent } from '@/components/galaxy/InspectorSidebar';
import ViewModeSelector from '@/components/galaxy/ViewModeSelector';
import ZoomControls from '@/components/galaxy/ZoomControls';
import GraphLegend from '@/components/galaxy/GraphLegend';
import ForceGraph from '@/components/galaxy/ForceGraph';
import EmptyState from '@/components/galaxy/EmptyState';
import { useGalaxyData } from '@/hooks/useGalaxyData';
import { GraphNode, GraphData, GraphLink } from '@/types/galaxy';
import PageHelmet from '@/components/PageHelmet';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';

const GalaxyExplorer: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const fgRef = useRef<any>(null);
  
  // Check if we're on mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Load data for the graph
  const { data: graphDataQuery, isLoading, refetch } = useGalaxyData();
  
  // Update graph data when API data changes
  useEffect(() => {
    if (graphDataQuery) {
      let filteredNodes: GraphNode[] = [...graphDataQuery.nodes];
      let filteredLinks: GraphLink[] = [...graphDataQuery.links];
      
      // Apply view mode filter
      if (viewMode !== 'all') {
        filteredNodes = graphDataQuery.nodes.filter(node => node.type === viewMode);
        
        // Only include links where both source and target nodes are in the filtered set
        const nodeIds = new Set(filteredNodes.map(n => {
          return String(n.id);
        }));
        
        filteredLinks = graphDataQuery.links.filter(link => {
          const sourceId = typeof link.source === 'object' ? 
            (link.source && 'id' in link.source ? String(link.source.id) : '') : 
            String(link.source || '');
            
          const targetId = typeof link.target === 'object' ? 
            (link.target && 'id' in link.target ? String(link.target.id) : '') : 
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
  
  // Handle node selection
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setShowSidebar(true);
  };
  
  // Handle sidebar close
  const handleSidebarClose = () => {
    setShowSidebar(false);
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.5, 400);
    }
  };
  
  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom / 1.5, 400);
    }
  };

  // Center the graph
  const handleCenterGraph = () => {
    if (fgRef.current) {
      fgRef.current.centerAt();
      fgRef.current.zoomToFit(400);
    }
  };

  return (
    <>
      <PageHelmet 
        title="Galaxy Explorer"
        description="Visualize the connections between strategies, plugins, and agents in your Allora OS workspace"
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Galaxy Explorer</h1>
        <p className="text-muted-foreground mt-2">Visualize connections between strategies and plugins</p>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-6 gap-4">
          <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
          <ZoomControls 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRefresh={() => refetch()}
            onCenter={handleCenterGraph}
          />
        </div>
        
        <div className="mt-4">
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
                fgRef={fgRef} 
                onNodeClick={handleNodeClick}
              />
            )}
          </Card>
        </div>
        
        <GraphLegend />
        
        {isMobile ? (
          // Mobile bottom sheet
          <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-lg">
              {selectedNode && (
                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-4">{selectedNode.name || selectedNode.title || 'Details'}</h2>
                  <InspectorContent node={selectedNode} />
                </div>
              )}
            </SheetContent>
          </Sheet>
        ) : (
          // Desktop sidebar
          <InspectorSidebar 
            node={selectedNode} 
            open={showSidebar} 
            onOpenChange={handleSidebarClose}
          />
        )}
      </div>
    </>
  );
};

export default GalaxyExplorer;
