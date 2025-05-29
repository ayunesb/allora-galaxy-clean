import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AgentVersion } from "@/types/agents";

type Agent = {
  id: string;
  name: string;
  type: string;
  // ...other fields...
};

type Vote = {
  id: string;
  agent_version_id: string;
  voter: string;
  value: number;
  created_at: string;
};

export function useAgentAdmin(agentType: string) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("agents").select("*").eq("type", agentType),
      supabase.from("agent_versions").select("*").eq("agent_type", agentType).order("created_at", { ascending: false }),
      supabase.from("votes").select("*").order("created_at", { ascending: false }),
    ]).then(([agentsRes, versionsRes, votesRes]) => {
      setAgents(agentsRes.data || []);
      setVersions(versionsRes.data || []);
      setVotes((votesRes.data || []).filter((v: Vote) =>
        versionsRes.data?.some((ver: AgentVersion) => ver.id === v.agent_version_id)
      ));
      setLoading(false);
    });
  }, [agentType]);

  return { agents, versions, votes, loading };
}