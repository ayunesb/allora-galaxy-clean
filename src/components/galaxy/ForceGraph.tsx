
import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from 'next-themes';
import { GraphData, GraphNode, ForceGraphProps } from '@/types/galaxy';

const ForceGraph: React.FC<ForceGraphProps> = ({ 
  graphData,
  onNodeClick,
  height = 600,
  width = '100%'
}) => {
  const graphRef = useRef<any>(null);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  // Define text and background colors based on theme
  const textColor = isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
  const backgroundColor = isDarkTheme ? '#1a1a1a' : '#f8f8f8';

  useEffect(() => {
    if (graphRef.current) {
      // Reheat simulation when data changes
      graphRef.current.d3Force('charge').strength(-150);
      graphRef.current.d3Force('link').distance(70);
      graphRef.current.d3Force('center').strength(0.8);
      
      // Set up tooltip when hovering over nodes
      graphRef.current
        .nodeCanvasObject((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name || node.label || node.id.substring(0, 6);
          const fontSize = 12 / globalScale;
          const nodeSize = node.size || 6;
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x || 0, node.y || 0, nodeSize, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || '#1e88e5';
          ctx.fill();
          
          // Draw border if color is provided
          if (node.borderColor) {
            ctx.strokeStyle = node.borderColor;
            ctx.lineWidth = node.borderWidth || 1;
            ctx.stroke();
          }
          
          // Draw node label
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = textColor;
          ctx.fillText(label, node.x || 0, (node.y || 0) + nodeSize + 3);
        });
    }
  }, [graphData, isDarkTheme, textColor]);

  return (
    <div style={{ width, height, background: backgroundColor }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        nodeId="id"
        onNodeClick={(node) => onNodeClick && onNodeClick(node as unknown as GraphNode)}
        cooldownTicks={100}
        linkColor={() => isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
      />
    </div>
  );
};

export default ForceGraph;
