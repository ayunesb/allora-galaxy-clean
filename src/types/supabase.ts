
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
      }
      tenant_user_roles: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      company_profiles: {
        Row: {
          id: string
          tenant_id: string
          name: string
          industry: string | null
          size: string | null
          revenue_range: string | null
          website: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          industry?: string | null
          size?: string | null
          revenue_range?: string | null
          website?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          industry?: string | null
          size?: string | null
          revenue_range?: string | null
          website?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      persona_profiles: {
        Row: {
          id: string
          tenant_id: string
          name: string
          tone: string | null
          goals: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          tone?: string | null
          goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          tone?: string | null
          goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      strategies: {
        Row: {
          id: string
          title: string
          description: string | null
          tenant_id: string
          created_at: string
          updated_at: string
          status: string
          created_by?: string
          approved_by?: string
          due_date?: string
          priority?: string
          tags?: string[]
          completion_percentage?: number
          metadata?: Json | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          tenant_id: string
          created_at?: string
          updated_at?: string
          status?: string
          created_by?: string
          approved_by?: string
          due_date?: string
          priority?: string
          tags?: string[]
          completion_percentage?: number
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          tenant_id?: string
          created_at?: string
          updated_at?: string
          status?: string
          created_by?: string
          approved_by?: string
          due_date?: string
          priority?: string
          tags?: string[]
          completion_percentage?: number
          metadata?: Json | null
        }
      }
      plugins: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          xp: number
          roi: number
          created_at: string
          updated_at: string
          icon: string | null
          category: string | null
          version: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          xp?: number
          roi?: number
          created_at?: string
          updated_at?: string
          icon?: string | null
          category?: string | null
          version: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          xp?: number
          roi?: number
          created_at?: string
          updated_at?: string
          icon?: string | null
          category?: string | null
          version?: string
          metadata?: Json | null
        }
      }
      agent_versions: {
        Row: {
          id: string
          plugin_id: string
          version: string
          prompt: string
          status: string
          xp: number
          created_at: string
          updated_at: string
          created_by: string | null
          upvotes: number
          downvotes: number
          description: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          plugin_id: string
          version: string
          prompt: string
          status?: string
          xp?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          upvotes?: number
          downvotes?: number
          description?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          plugin_id?: string
          version?: string
          prompt?: string
          status?: string
          xp?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          upvotes?: number
          downvotes?: number
          description?: string | null
          metadata?: Json | null
        }
      }
      plugin_logs: {
        Row: {
          id: string
          plugin_id: string
          strategy_id: string | null
          agent_version_id: string | null
          tenant_id: string
          status: string
          input: Json | null
          output: Json | null
          error: string | null
          created_at: string
          execution_time: number
          xp_earned: number
          event: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          plugin_id: string
          strategy_id?: string | null
          agent_version_id?: string | null
          tenant_id: string
          status: string
          input?: Json | null
          output?: Json | null
          error?: string | null
          created_at?: string
          execution_time?: number
          xp_earned?: number
          event: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          plugin_id?: string
          strategy_id?: string | null
          agent_version_id?: string | null
          tenant_id?: string
          status?: string
          input?: Json | null
          output?: Json | null
          error?: string | null
          created_at?: string
          execution_time?: number
          xp_earned?: number
          event?: string
          metadata?: Json | null
        }
      }
      kpis: {
        Row: {
          id: string
          tenant_id: string
          name: string
          value: number
          previous_value: number | null
          source: string | null
          category: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          value: number
          previous_value?: number | null
          source?: string | null
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          value?: number
          previous_value?: number | null
          source?: string | null
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      agent_votes: {
        Row: {
          id: string
          agent_version_id: string
          user_id: string
          vote_type: "up" | "down"
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_version_id: string
          user_id: string
          vote_type: "up" | "down"
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_version_id?: string
          user_id?: string
          vote_type?: "up" | "down"
          comment?: string | null
          created_at?: string
        }
      }
      executions: {
        Row: {
          id: string
          tenant_id: string
          type: string
          status: string
          strategy_id: string | null
          plugin_id: string | null
          agent_version_id: string | null
          executed_by: string | null
          input: Json | null
          output: Json | null
          error: string | null
          created_at: string
          execution_time: number
          xp_earned: number
        }
        Insert: {
          id?: string
          tenant_id: string
          type: string
          status: string
          strategy_id?: string | null
          plugin_id?: string | null
          agent_version_id?: string | null
          executed_by?: string | null
          input?: Json | null
          output?: Json | null
          error?: string | null
          created_at?: string
          execution_time?: number
          xp_earned?: number
        }
        Update: {
          id?: string
          tenant_id?: string
          type?: string
          status?: string
          strategy_id?: string | null
          plugin_id?: string | null
          agent_version_id?: string | null
          executed_by?: string | null
          input?: Json | null
          output?: Json | null
          error?: string | null
          created_at?: string
          execution_time?: number
          xp_earned?: number
        }
      }
      system_logs: {
        Row: {
          id: string
          module: string
          event: string
          context: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          module: string
          event: string
          context?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          module?: string
          event?: string
          context?: Json | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
          metadata: Json | null
          cancellation_date: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
          cancellation_date?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
          cancellation_date?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
