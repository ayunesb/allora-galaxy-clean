
import { StrategyInspector } from "./node-inspectors/StrategyInspector";
import { PluginInspector } from "./node-inspectors/PluginInspector";
import { AgentInspector } from "./node-inspectors/AgentInspector";

export interface InspectorContentProps {
  node: any;
}

// Component for the sidebar content to be reusable in mobile view
export function InspectorContent({ node }: InspectorContentProps) {
  if (!node) return null;

  switch (node.type) {
    case "strategy":
      return <StrategyInspector node={node} />;

    case "plugin":
      return <PluginInspector node={node} />;

    case "agent":
      return <AgentInspector node={node} />;

    default:
      return <p>No details available</p>;
  }
}
