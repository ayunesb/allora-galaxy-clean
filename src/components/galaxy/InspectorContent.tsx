
import { StrategyInspector } from "./node-inspectors/StrategyInspector";
import { PluginInspector } from "./node-inspectors/PluginInspector";
import { AgentInspector } from "./node-inspectors/AgentInspector";
import { AgentNode, GraphNode, PluginNode, StrategyNode } from "@/types/galaxy";
import { getNodeTitle, getNodeType } from "./node-inspectors/NodeUtilities";

export interface InspectorContentProps {
  node: GraphNode;
}

// Component for the sidebar content to be reusable in mobile view
export function InspectorContent({ node }: InspectorContentProps) {
  if (!node) return null;

  switch (node.type) {
    case "strategy":
      return <StrategyInspector node={node as StrategyNode} />;

    case "plugin":
      return <PluginInspector node={node as PluginNode} />;

    case "agent":
      return <AgentInspector node={node as AgentNode} />;

    default:
      return <p>No details available for {getNodeType(node)} node</p>;
  }
}
