
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { GraphData, GraphNode } from '@/types/galaxy';

// Using dynamic import instead of direct import to avoid build errors
const ForceGraph2D = React.lazy(() => 
  import('react-force-graph').then(module => ({ 
    default: module.ForceGraph2D 
  }))
);

interface ForceGraphProps {
  graphData: GraphData;
  fgRef: React.RefObject<any>;
  onNodeClick: (node: GraphNode) => void;
}

const ForceGraph: React.FC<ForceGraphProps> = ({ graphData, fgRef, onNodeClick }) => {
  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'strategy') return '#3498db';
    if (node.type === 'plugin') return '#9b59b6';
    if (node.type === 'agent') return '#2ecc71';
    return '#ccc';
  };

  return (
    <div className="h-[800px] w-full">
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }>
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
          onNodeClick={onNodeClick}
        />
      </Suspense>
    </div>
  );
};

export default ForceGraph;
