
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraphNode } from '@/types/galaxy';
import { useGalaxyData } from '@/hooks/useGalaxyData';
import { useIsMobile } from '@/hooks/use-mobile';
import GalaxyLoader from '@/components/galaxy/GalaxyLoader';
import InspectorSidebar from '@/components/galaxy/InspectorSidebar';
import MobileInspector from '@/components/galaxy/MobileInspector';
import GalaxyControls from '@/components/galaxy/GalaxyControls';
import ViewModeSelector from '@/components/galaxy/ViewModeSelector';
import GraphLegend from '@/components/galaxy/GraphLegend';
import EmptyState from '@/components/galaxy/EmptyState';
import ForceGraph from '@/components/galaxy/ForceGraph';

const GalaxyExplorer: React.FC = () => {
  const { data, isLoading, error, refetch } = useGalaxyData();
  const isMobile = useIsMobile();
  const fgRef = useRef();
  const [viewMode, setViewMode] = useState('all');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [is3D, setIs3D] = useState(false);

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  };

  // Reset selected node
  const handleCloseInspector = () => {
    setSelectedNode(null);
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (fgRef.current) {
      (fgRef.current as any).zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      (fgRef.current as any).zoomOut();
    }
  };

  const handleRefresh = () => {
    refetch();
    setSelectedNode(null);
  };
  
  const handleCenterGraph = () => {
    if (fgRef.current) {
      (fgRef.current as any).zoomToFit();
    }
  };

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Galaxy Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{(error as Error).message}</p>
            <Button onClick={handleRefresh} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no data, show empty state
  if (!data || data.nodes.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-0">
            <EmptyState />
          </CardContent>
        </Card>
      </div>
    );
  }

  const nodeTypes = [
    { type: 'strategy', color: '#2563eb', label: 'Strategy' },
    { type: 'plugin', color: '#10b981', label: 'Plugin' },
    { type: 'agent', color: '#f59e0b', label: 'Agent' },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Strategy Galaxy</h1>
        
        <div className="flex gap-2">
          <ViewModeSelector 
            viewMode={viewMode} 
            onChange={setViewMode}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className={`md:col-span-${selectedNode && !isMobile ? '9' : '12'}`}>
          <GalaxyControls 
            viewMode={viewMode}
            setViewMode={setViewMode}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRefresh={handleRefresh}
            onCenter={handleCenterGraph}
          />
          
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Graph Legend</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <GraphLegend 
                nodeTypes={nodeTypes}
              />
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            {data.nodes.length > 0 ? (
              <ForceGraph 
                graphData={data} 
                fgRef={fgRef as any} 
                onNodeClick={handleNodeClick}
                selectedNode={selectedNode}
              />
            ) : (
              <EmptyState />
            )}
          </Card>
        </div>
        
        {selectedNode && !isMobile && (
          <div className="md:col-span-3">
            <InspectorSidebar 
              node={selectedNode} 
              onClose={handleCloseInspector} 
            />
          </div>
        )}
      </div>
      
      {isMobile && selectedNode && (
        <MobileInspector 
          node={selectedNode}
          onClose={handleCloseInspector}
        />
      )}
    </div>
  );
};

export default GalaxyExplorer;
