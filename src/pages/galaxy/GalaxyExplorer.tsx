
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGalaxyData } from '@/hooks/useGalaxyData';
import { GraphNode } from '@/types/galaxy';
import ViewModeSelector from '@/components/galaxy/ViewModeSelector';
import ZoomControls from '@/components/galaxy/ZoomControls';
import ForceGraph from '@/components/galaxy/ForceGraph';
import { InspectorSidebar } from '@/components/galaxy/InspectorSidebar';
import { GraphLegend } from '@/components/galaxy/GraphLegend';
import MobileInspector from '@/components/galaxy/MobileInspector';
import { useMobile } from '@/hooks/useMobile';

const GalaxyExplorer: React.FC = () => {
  const { data: graphData, isLoading: loading, error } = useGalaxyData();
  const [viewMode, setViewMode] = useState<string>('strategy');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const fgRef = useRef<any>();
  const { isMobile } = useMobile();

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleCloseInspector = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomOut();
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.resetView();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Galaxy Data</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Node types for legend
  const nodeTypes = [
    { type: 'strategy', color: '#3b82f6', label: 'Strategy' },
    { type: 'plugin', color: '#10b981', label: 'Plugin' },
    { type: 'agent', color: '#f59e0b', label: 'Agent' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Galaxy Explorer</h1>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <ViewModeSelector 
            viewMode={viewMode} 
            onModeChange={setViewMode} 
          />
          
          <ZoomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      <div className="flex-1 relative">
        <Card className="absolute inset-0 m-4 overflow-hidden">
          <CardContent className="p-0 h-full relative">
            {/* Graph Legend */}
            <div className="absolute top-4 left-4 z-10">
              <GraphLegend
                items={nodeTypes}
              />
            </div>
            
            {/* Force Graph */}
            <div className="h-full">
              {graphData && (
                <ForceGraph 
                  graphData={graphData} 
                  onNodeClick={handleNodeClick}
                />
              )}
            </div>

            {/* Inspector */}
            {selectedNode && !isMobile && (
              <InspectorSidebar 
                node={selectedNode} 
                onClose={handleCloseInspector} 
              />
            )}
          </CardContent>
        </Card>

        {/* Mobile Inspector */}
        {selectedNode && isMobile && (
          <MobileInspector 
            node={selectedNode} 
            onClose={handleCloseInspector}
          />
        )}
      </div>
    </div>
  );
};

export default GalaxyExplorer;
