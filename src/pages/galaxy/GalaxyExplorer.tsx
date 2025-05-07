
import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import InspectorSidebar from '@/components/galaxy/InspectorSidebar';

// Type definitions for graph data
interface GraphNode {
  id: string;
  name: string;
  type: 'strategy' | 'plugin' | 'agent';
  [key: string]: any;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const GalaxyExplorer: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const fgRef = useRef<any>(null);
  
  // Load data for the graph
  const { data: graphDataQuery, isLoading, refetch } = useQuery({
    queryKey: ['galaxy_data'],
    queryFn: async () => {
      // Fetch strategies
      const { data: strategies, error: strategiesError } = await supabase
        .from('strategies')
        .select('*');
        
      if (strategiesError) throw strategiesError;
      
      // Fetch plugins
      const { data: plugins, error: pluginsError } = await supabase
        .from('plugins')
        .select('*');
        
      if (pluginsError) throw pluginsError;
      
      // Fetch agent versions
      const { data: agentVersions, error: agentsError } = await supabase
        .from('agent_versions')
        .select('*, plugins(id, name)');
        
      if (agentsError) throw agentsError;
      
      // Fetch plugin logs to establish relationships
      const { data: pluginLogs, error: logsError } = await supabase
        .from('plugin_logs')
        .select('strategy_id, plugin_id, agent_version_id');
        
      if (logsError) throw logsError;
      
      // Create nodes and links for the graph
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      
      // Add strategy nodes
      strategies?.forEach((strategy) => {
        nodes.push({
          id: `strategy-${strategy.id}`,
          realId: strategy.id,
          name: strategy.title,
          type: 'strategy',
          ...strategy,
        });
      });
      
      // Add plugin nodes
      plugins?.forEach((plugin) => {
        nodes.push({
          id: `plugin-${plugin.id}`,
          realId: plugin.id,
          name: plugin.name,
          type: 'plugin',
          ...plugin,
        });
      });
      
      // Add agent version nodes
      agentVersions?.forEach((agent) => {
        nodes.push({
          id: `agent-${agent.id}`,
          realId: agent.id,
          name: `${agent.plugins?.name || 'Unknown'} v${agent.version}`,
          type: 'agent',
          ...agent,
        });
        
        // Link agent versions to plugins
        if (agent.plugin_id) {
          links.push({
            source: `agent-${agent.id}`,
            target: `plugin-${agent.plugin_id}`,
            type: 'is_version_of'
          });
        }
      });
      
      // Add links between strategies and plugins based on plugin logs
      pluginLogs?.forEach((log) => {
        if (log.strategy_id && log.plugin_id) {
          links.push({
            source: `strategy-${log.strategy_id}`,
            target: `plugin-${log.plugin_id}`,
            type: 'uses'
          });
        }
        
        if (log.plugin_id && log.agent_version_id) {
          links.push({
            source: `plugin-${log.plugin_id}`,
            target: `agent-${log.agent_version_id}`,
            type: 'executed'
          });
        }
      });
      
      return { nodes, links };
    }
  });
  
  // Update graph data when API data changes
  useEffect(() => {
    if (graphDataQuery) {
      let filteredNodes = [...graphDataQuery.nodes];
      let filteredLinks = [...graphDataQuery.links];
      
      // Apply view mode filter
      if (viewMode !== 'all') {
        filteredNodes = graphDataQuery.nodes.filter(node => node.type === viewMode);
        
        // Only include links where both source and target nodes are in the filtered set
        const nodeIds = new Set(filteredNodes.map(n => n.id));
        filteredLinks = graphDataQuery.links.filter(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return nodeIds.has(sourceId) && nodeIds.has(targetId);
        });
      }
      
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
  
  // Node color by type
  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'strategy') return '#3498db';
    if (node.type === 'plugin') return '#9b59b6';
    if (node.type === 'agent') return '#2ecc71';
    return '#ccc';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Galaxy Explorer</h1>
      <p className="text-muted-foreground mt-2">Visualize connections between strategies and plugins</p>
      
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-3">
          <span className="text-sm">View:</span>
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="strategy">Strategies Only</SelectItem>
              <SelectItem value="plugin">Plugins Only</SelectItem>
              <SelectItem value="agent">Agents Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-4">
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : graphData.nodes.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-96">
              <p className="text-xl font-medium">No data available</p>
              <p className="text-muted-foreground mt-2">Try adding some strategies or plugins</p>
            </div>
          ) : (
            <div className="h-[800px] w-full">
              <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeId="id"
                nodeLabel="name"
                nodeColor={getNodeColor}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkCurvature={0.25}
                nodeRelSize={6}
                onNodeClick={handleNodeClick}
              />
            </div>
          )}
        </Card>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-sm">Strategies</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-600"></div>
          <span className="text-sm">Plugins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm">Agent Versions</span>
        </div>
      </div>
      
      {/* Inspector Sidebar */}
      <InspectorSidebar 
        node={selectedNode} 
        open={showSidebar} 
        onOpenChange={handleSidebarClose}
      />
    </div>
  );
};

export default GalaxyExplorer;
