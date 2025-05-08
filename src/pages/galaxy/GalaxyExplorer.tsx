
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useGalaxyData } from '@/hooks/useGalaxyData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForceGraph } from '@/components/galaxy/ForceGraph';
import { InspectorSidebar } from '@/components/galaxy/InspectorSidebar';
import { MobileInspector } from '@/components/galaxy/MobileInspector';
import { GalaxyControls } from '@/components/galaxy/GalaxyControls';
import { GraphLegend } from '@/components/galaxy/GraphLegend';
import { GalaxyLoader } from '@/components/galaxy/GalaxyLoader';
import { EmptyState } from '@/components/galaxy/EmptyState';
import { ViewModeSelector } from '@/components/galaxy/ViewModeSelector';
import { ZoomControls } from '@/components/galaxy/ZoomControls';
import { GraphNode } from '@/types/galaxy';
import { useMobileBreakpoint } from '@/hooks/use-mobile';

const GalaxyExplorer = () => {
  const { tenant } = useWorkspace();
  const { data, loading, error } = useGalaxyData(tenant?.id);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState('3d');
  const [showInspector, setShowInspector] = useState(false);
  const isMobile = useMobileBreakpoint();
  
  // Reset selected node when data changes
  useEffect(() => {
    setSelectedNode(null);
  }, [data]);
  
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (isMobile) {
      setShowInspector(true);
    }
  };
  
  const handleInspectorClose = () => {
    setShowInspector(false);
    setSelectedNode(null);
  };
  
  if (loading) {
    return <GalaxyLoader />;
  }
  
  if (error) {
    return (
      <Card className="m-6 p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Error Loading Galaxy</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Card>
    );
  }
  
  if (!data || data.nodes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-full w-full flex relative">
      <div className="flex-1 h-full relative">
        <ForceGraph 
          data={data} 
          onNodeClick={handleNodeClick}
          selectedNode={selectedNode}
          is3d={viewMode === '3d'}
        />
        
        <div className="absolute top-4 right-4 z-10">
          <ViewModeSelector
            mode={viewMode}
            onChange={setViewMode}
          />
        </div>
        
        <div className="absolute bottom-4 left-4 z-10">
          <GraphLegend />
        </div>
        
        <div className="absolute bottom-4 right-4 z-10">
          <ZoomControls />
        </div>
        
        <div className="absolute top-4 left-4 z-10">
          <GalaxyControls />
        </div>
      </div>
      
      {!isMobile && (
        <InspectorSidebar 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
        />
      )}
      
      {isMobile && showInspector && (
        <MobileInspector 
          node={selectedNode} 
          onClose={handleInspectorClose} 
        />
      )}
    </div>
  );
};

export default GalaxyExplorer;
