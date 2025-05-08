
import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { useGalaxyData } from '@/hooks/useGalaxyData';
import { GraphNode, GraphData } from '@/types/galaxy';
import ForceGraph from '@/components/galaxy/ForceGraph';
import ZoomControls from '@/components/galaxy/ZoomControls';
import GalaxyLoader from '@/components/galaxy/GalaxyLoader';
import ViewModeSelector from '@/components/galaxy/ViewModeSelector';
import GalaxyControls from '@/components/galaxy/GalaxyControls';
import InspectorSidebar from '@/components/galaxy/InspectorSidebar';
import MobileInspector from '@/components/galaxy/MobileInspector';
import GraphLegend from '@/components/galaxy/GraphLegend';
import { useMobile } from '@/hooks/use-mobile';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import EmptyState from '@/components/galaxy/EmptyState';

const GalaxyExplorer: React.FC = () => {
  const { isLoading, graphData, error, refresh } = useGalaxyData();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<string>('all');
  const isMobile = useMobile();
  const fgRef = useRef<any>();
  
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleZoomIn = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 0.8);
    }
  };

  const handleRefresh = () => {
    refresh();
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  const handleCloseInspector = () => {
    setSelectedNode(null);
  };

  if (isLoading) {
    return (
      <GalaxyLoader 
        viewMode={viewMode} 
        fgRef={fgRef} 
        onNodeClick={handleNodeClick} 
      />
    );
  }

  if (error || !graphData || graphData.nodes.length === 0) {
    return <EmptyState onRefresh={refresh} error={error} />;
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-hidden">
        {/* Main Graph */}
        <ForceGraph 
          data={graphData as GraphData}
          onNodeClick={handleNodeClick}
          selectedNode={selectedNode}
          is3d={false}
        />
        
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <ViewModeSelector
            viewMode={viewMode}
            onChange={setViewMode}
          />
          
          <Card className="p-2">
            <ZoomControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onRefresh={handleRefresh}
            />
          </Card>
          
          <GalaxyControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRefresh={handleRefresh}
          />
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <GraphLegend
            nodeTypes={[
              { type: 'strategy', color: '#3B82F6', label: 'Strategy' },
              { type: 'plugin', color: '#10B981', label: 'Plugin' },
              { type: 'agent', color: '#F59E0B', label: 'Agent' }
            ]}
          />
        </div>
      </div>
      
      {/* Inspector Sidebar */}
      {!isMobile && (
        <InspectorSidebar
          node={selectedNode}
          onClose={handleCloseInspector}
        />
      )}
      
      {/* Mobile Inspector */}
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
