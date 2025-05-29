export interface Agent {
  id: string
  name: string
  agent_type: string
  current_version: string
  success_rate: number
  xp: number
  created_at: string
  updated_at?: string
}

export interface AgentVote {
  id: string
  agent_id: string
  agent_type: string
  from_version: string
  to_version: string
  reason: string
  voter: string
  created_at: string
}
