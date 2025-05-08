
/// <reference types="vite/client" />

// This adds explicit types for modules that might be causing issues
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

// Add specific type declarations for the ForceGraph library
declare module 'react-force-graph' {
  import { Component } from 'react';
  
  export type GraphNodeObject = {
    id?: string | number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number;
    fy?: number;
    [key: string]: any;
  };

  export type NodeAccessor<T, V> = ((obj: T) => V) | V | undefined;

  export interface ForceGraphProps {
    graphData: {
      nodes: GraphNodeObject[];
      links: any[];
    };
    nodeId?: string;
    nodeLabel?: NodeAccessor<GraphNodeObject, string>;
    nodeColor?: NodeAccessor<GraphNodeObject, string>;
    nodeRelSize?: number;
    linkDirectionalArrowLength?: number;
    linkDirectionalArrowRelPos?: number;
    linkCurvature?: number;
    onNodeClick?: (node: GraphNodeObject, event: MouseEvent) => void;
    [key: string]: any;
  }

  export class ForceGraph2D extends Component<ForceGraphProps> {}
  export class ForceGraph3D extends Component<ForceGraphProps> {}
  export class ForceGraphVR extends Component<ForceGraphProps> {}
  export class ForceGraphAR extends Component<ForceGraphProps> {}
}

// Add declaration for uuid module
declare module 'uuid' {
  export function v4(): string;
}

// Extend Window interface for global variables
interface Window {
  ENV?: Record<string, string>;
}
