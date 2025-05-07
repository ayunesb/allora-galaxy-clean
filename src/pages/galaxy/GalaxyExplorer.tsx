
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import PageHelmet from '@/components/PageHelmet';
import InspectorSidebar from '@/components/galaxy/InspectorSidebar';
import GraphLegend from '@/components/galaxy/GraphLegend';
import GalaxyLoader from '@/components/galaxy/GalaxyLoader';
import GalaxyControls from '@/components/galaxy/GalaxyControls';
import MobileInspector from '@/components/galaxy/MobileInspector';
import { GraphNode } from '@/types/galaxy';

const GalaxyExplorer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const fgRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if we're on mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Handle node selection and navigation
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setShowSidebar(true);
    
    // Navigate to detailed view based on node type
    if (node.realId) {
      switch (node.type) {
        case 'plugin':
          // You can uncomment this when you have a plugin detail page
          // navigate(`/plugins/${node.realId}`);
          toast({
            title: "Plugin Selected",
            description: `Viewing details for ${node.name || 'plugin'}`
          });
          break;
        case 'strategy':
          // You can uncomment this when you have a strategy detail page
          // navigate(`/strategy/${node.realId}`);
          toast({
            title: "Strategy Selected",
            description: `Viewing details for ${node.name || node.title || 'strategy'}`
          });
          break;
        case 'agent':
          toast({
            title: "Agent Selected",
            description: `Viewing details for ${node.name || 'agent version'}`
          });
          break;
        default:
          break;
      }
    }
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
  
  // Handle data refresh
  const handleRefresh = () => {
    // The actual refetch function is in GalaxyLoader
    toast({
      title: "Refreshing data",
      description: "Fetching the latest galaxy data"
    });
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
        
        <GalaxyControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRefresh={handleRefresh}
          onCenter={handleCenterGraph}
        />
        
        <div className="mt-4">
          <GalaxyLoader 
            viewMode={viewMode}
            fgRef={fgRef}
            onNodeClick={handleNodeClick}
          />
        </div>
        
        <GraphLegend />
        
        {isMobile ? (
          <MobileInspector
            selectedNode={selectedNode}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
          />
        ) : (
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
