import React from "react";
import AgentVersionTabs from "@/components/admin/agents/AgentVersionTabs";
import { useAgentAdmin } from "../../../hooks/useAgentAdmin";

export default function AdminAgentsPage() {
  const { agentTypes } = useAgentAdmin(); // <-- If useAgentAdmin requires an argument, pass it here

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Multi-Agent Version Control</h1>
      <AgentVersionTabs agentTypes={agentTypes} />
    </div>
  );
}

// The warning "No routes matched location '/insights/kpis'" means you navigated to a route that does not exist.
// To resolve this, either:
// 1. Add a <Route path="/insights/kpis" ... /> to your router, or
// 2. Remove or update any navigation/sidebar links pointing to "/insights/kpis" to use a valid route.