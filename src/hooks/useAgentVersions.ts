import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AgentVersion } from "@/types/agents";

export function useAgentVersions(agentType: string) {
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("agent_versions")
        .select("*")
        .eq("agent_type", agentType)
        .order("created_at", { ascending: false });

      if (!error && data) setVersions(data);
      setLoading(false);
    };

    load();
  }, [agentType]);

  return { versions, loading };
}
