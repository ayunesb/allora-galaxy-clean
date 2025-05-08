
import React, { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData, GraphNode } from '@/types/galaxy';

interface ForceGraphProps {
  data: GraphData;
  fgRef?: React.MutableRefObject<any>;
  onNodeClick: (node: GraphNode) => void;
}

export const ForceGraph: React.FC<ForceGraphProps> = ({ data, fgRef, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const localFgRef = useRef<any>();
  const graphRef = fgRef || localFgRef;

  // Update graph size on resize
  useEffect(() => {
    const handleResize = () => {
      if (graphRef.current && containerRef.current) {
        graphRef.current.width(containerRef.current.clientWidth);
        graphRef.current.height(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial size
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [graphRef]);

  if (!data || !data.nodes || !data.links) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No data available for visualization</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeLabel={(node) => 
          `${(node as GraphNode).name || (node as GraphNode).title || 'Unknown'}\n${
            (node as GraphNode).type || 'Node'
          }`
        }
        nodeColor={(node) => {
          const n = node as GraphNode;
          if (n.color) return n.color;
          
          switch (n.type) {
            case 'strategy': return '#3b82f6';
            case 'plugin': return '#10b981';
            case 'agent': return '#f59e0b';
            default: return '#94a3b8';
          }
        }}
        nodeVal={(node) => (node as GraphNode).val || 1}
        linkColor={() => '#cbd5e1'}
        linkWidth={1}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node) => onNodeClick(node as GraphNode)}
        cooldownTicks={100}
        nodeRelSize={6}
      />
    </div>
  );
};
