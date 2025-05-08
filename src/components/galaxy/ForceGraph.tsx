
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
// We'll use react-force-graph directly instead of react-force-graph-2d
import ForceGraph2D from 'react-force-graph';
import { useTheme } from '@/hooks/useTheme';

interface ForceGraphProps {
  graphData: any;
  onNodeClick: (node: any) => void;
  onBackgroundClick: () => void;
  highlightedNodeId?: string | null;
  selectedNodeId?: string | null;
  viewMode?: string;
  className?: string;
}

export const ForceGraph: React.FC<ForceGraphProps> = ({
  graphData,
  onNodeClick,
  onBackgroundClick,
  highlightedNodeId,
  selectedNodeId,
  viewMode = 'strategy',
  className = '',
}) => {
  const graphRef = useRef<any>(null);
  const { theme } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Set initial dimensions
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Node color based on type and theme
  const getNodeColor = (node: any) => {
    const isDark = theme === 'dark';
    
    switch (node.type) {
      case 'strategy':
        return isDark ? '#9333ea' : '#a855f7'; // Purple
      case 'plugin':
        return isDark ? '#2563eb' : '#3b82f6'; // Blue
      case 'agent':
        return isDark ? '#16a34a' : '#22c55e'; // Green
      default:
        return isDark ? '#6b7280' : '#9ca3af'; // Gray
    }
  };

  // Link color based on theme
  const getLinkColor = (link: any) => {
    return theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
  };

  // Handle node size
  const getNodeSize = (node: any) => {
    if (node.id === selectedNodeId || node.id === highlightedNodeId) {
      return 8;
    }
    
    switch (node.type) {
      case 'strategy':
        return 6;
      case 'plugin':
        return 5;
      case 'agent':
        return 4;
      default:
        return 3;
    }
  };

  return (
    <Card className={`overflow-hidden border ${className}`} ref={containerRef}>
      <div className="w-full h-full">
        {graphData?.nodes && graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeLabel={node => node.name || node.id}
            nodeColor={getNodeColor}
            nodeRelSize={6}
            nodeVal={getNodeSize}
            linkColor={getLinkColor}
            linkWidth={1}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={0.8}
            onNodeClick={onNodeClick}
            onBackgroundClick={onBackgroundClick}
            cooldownTicks={100}
            onEngineStop={() => {
              // Center after initial layout
              if (graphRef.current) {
                graphRef.current.zoomToFit(400, 40);
              }
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default ForceGraph;
