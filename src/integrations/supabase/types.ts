export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      agent_version_analyses: {
        Row: {
          agent_version_id: string | null;
          analyzed_at: string | null;
          created_at: string | null;
          diff_summary: string;
          id: string;
          impact_rationale: string;
          plugin_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          agent_version_id?: string | null;
          analyzed_at?: string | null;
          created_at?: string | null;
          diff_summary: string;
          id?: string;
          impact_rationale: string;
          plugin_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          agent_version_id?: string | null;
          analyzed_at?: string | null;
          created_at?: string | null;
          diff_summary?: string;
          id?: string;
          impact_rationale?: string;
          plugin_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "agent_version_analyses_agent_version_id_fkey";
            columns: ["agent_version_id"];
            isOneToOne: false;
            referencedRelation: "agent_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_version_analyses_plugin_id_fkey";
            columns: ["plugin_id"];
            isOneToOne: false;
            referencedRelation: "plugins";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_versions: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          downvotes: number | null;
          id: string;
          plugin_id: string | null;
          prompt: string;
          status: string;
          updated_at: string | null;
          upvotes: number | null;
          version: string;
          xp: number | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          downvotes?: number | null;
          id?: string;
          plugin_id?: string | null;
          prompt: string;
          status: string;
          updated_at?: string | null;
          upvotes?: number | null;
          version: string;
          xp?: number | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          downvotes?: number | null;
          id?: string;
          plugin_id?: string | null;
          prompt?: string;
          status?: string;
          updated_at?: string | null;
          upvotes?: number | null;
          version?: string;
          xp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "agent_versions_plugin_id_fkey";
            columns: ["plugin_id"];
            isOneToOne: false;
            referencedRelation: "plugins";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_votes: {
        Row: {
          agent_version_id: string | null;
          comment: string | null;
          created_at: string | null;
          id: string;
          user_id: string | null;
          vote_type: string;
        };
        Insert: {
          agent_version_id?: string | null;
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          user_id?: string | null;
          vote_type: string;
        };
        Update: {
          agent_version_id?: string | null;
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          user_id?: string | null;
          vote_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_votes_agent_version_id_fkey";
            columns: ["agent_version_id"];
            isOneToOne: false;
            referencedRelation: "agent_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      api_keys: {
        Row: {
          created_at: string | null;
          created_by: string;
          expires_at: string | null;
          id: string;
          key: string;
          key_prefix: string;
          last_used_at: string | null;
          metadata: Json | null;
          name: string;
          scope: string[];
          status: string;
          tenant_id: string;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          expires_at?: string | null;
          id?: string;
          key: string;
          key_prefix: string;
          last_used_at?: string | null;
          metadata?: Json | null;
          name: string;
          scope?: string[];
          status?: string;
          tenant_id: string;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          expires_at?: string | null;
          id?: string;
          key?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          metadata?: Json | null;
          name?: string;
          scope?: string[];
          status?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      company_profiles: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          industry: string | null;
          name: string;
          revenue_range: string | null;
          size: string | null;
          tenant_id: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          industry?: string | null;
          name: string;
          revenue_range?: string | null;
          size?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          industry?: string | null;
          name?: string;
          revenue_range?: string | null;
          size?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_profiles_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      cookie_preferences: {
        Row: {
          accepted_at: string | null;
          ga4_enabled: boolean | null;
          id: string;
          meta_pixel_enabled: boolean | null;
          session_analytics_enabled: boolean | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          ga4_enabled?: boolean | null;
          id?: string;
          meta_pixel_enabled?: boolean | null;
          session_analytics_enabled?: boolean | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          ga4_enabled?: boolean | null;
          id?: string;
          meta_pixel_enabled?: boolean | null;
          session_analytics_enabled?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      executions: {
        Row: {
          agent_version_id: string | null;
          created_at: string | null;
          error: string | null;
          executed_by: string | null;
          execution_time: number | null;
          id: string;
          input: Json | null;
          output: Json | null;
          plugin_id: string | null;
          status: string;
          strategy_id: string | null;
          tenant_id: string | null;
          type: string;
          xp_earned: number | null;
        };
        Insert: {
          agent_version_id?: string | null;
          created_at?: string | null;
          error?: string | null;
          executed_by?: string | null;
          execution_time?: number | null;
          id?: string;
          input?: Json | null;
          output?: Json | null;
          plugin_id?: string | null;
          status: string;
          strategy_id?: string | null;
          tenant_id?: string | null;
          type: string;
          xp_earned?: number | null;
        };
        Update: {
          agent_version_id?: string | null;
          created_at?: string | null;
          error?: string | null;
          executed_by?: string | null;
          execution_time?: number | null;
          id?: string;
          input?: Json | null;
          output?: Json | null;
          plugin_id?: string | null;
          status?: string;
          strategy_id?: string | null;
          tenant_id?: string | null;
          type?: string;
          xp_earned?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "executions_agent_version_id_fkey";
            columns: ["agent_version_id"];
            isOneToOne: false;
            referencedRelation: "agent_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "executions_plugin_id_fkey";
            columns: ["plugin_id"];
            isOneToOne: false;
            referencedRelation: "plugins";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "executions_strategy_id_fkey";
            columns: ["strategy_id"];
            isOneToOne: false;
            referencedRelation: "strategies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "executions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      kpis: {
        Row: {
          category: string | null;
          created_at: string | null;
          date: string;
          id: string;
          name: string;
          previous_value: number | null;
          source: string | null;
          tenant_id: string | null;
          updated_at: string | null;
          value: number;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          date?: string;
          id?: string;
          name: string;
          previous_value?: number | null;
          source?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
          value: number;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          date?: string;
          id?: string;
          name?: string;
          previous_value?: number | null;
          source?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "kpis_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          assigned_to: string | null;
          company: string | null;
          created_at: string | null;
          email: string;
          id: string;
          last_activity: string | null;
          metadata: Json | null;
          name: string | null;
          score: number | null;
          source: string;
          status: string;
          tenant_id: string;
          updated_at: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          company?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          last_activity?: string | null;
          metadata?: Json | null;
          name?: string | null;
          score?: number | null;
          source: string;
          status?: string;
          tenant_id: string;
          updated_at?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          company?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          last_activity?: string | null;
          metadata?: Json | null;
          name?: string | null;
          score?: number | null;
          source?: string;
          status?: string;
          tenant_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          action_label: string | null;
          action_url: string | null;
          created_at: string;
          id: string;
          message: string;
          metadata: Json | null;
          read_at: string | null;
          tenant_id: string;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          action_label?: string | null;
          action_url?: string | null;
          created_at?: string;
          id?: string;
          message: string;
          metadata?: Json | null;
          read_at?: string | null;
          tenant_id: string;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          action_label?: string | null;
          action_url?: string | null;
          created_at?: string;
          id?: string;
          message?: string;
          metadata?: Json | null;
          read_at?: string | null;
          tenant_id?: string;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_tenant";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      persona_profiles: {
        Row: {
          created_at: string | null;
          goals: string[] | null;
          id: string;
          name: string;
          tenant_id: string | null;
          tone: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          goals?: string[] | null;
          id?: string;
          name: string;
          tenant_id?: string | null;
          tone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          goals?: string[] | null;
          id?: string;
          name?: string;
          tenant_id?: string | null;
          tone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "persona_profiles_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      plugin_logs: {
        Row: {
          agent_version_id: string | null;
          created_at: string | null;
          error: string | null;
          execution_time: number | null;
          id: string;
          input: Json | null;
          output: Json | null;
          plugin_id: string | null;
          status: string;
          strategy_id: string | null;
          tenant_id: string | null;
          xp_earned: number | null;
        };
        Insert: {
          agent_version_id?: string | null;
          created_at?: string | null;
          error?: string | null;
          execution_time?: number | null;
          id?: string;
          input?: Json | null;
          output?: Json | null;
          plugin_id?: string | null;
          status: string;
          strategy_id?: string | null;
          tenant_id?: string | null;
          xp_earned?: number | null;
        };
        Update: {
          agent_version_id?: string | null;
          created_at?: string | null;
          error?: string | null;
          execution_time?: number | null;
          id?: string;
          input?: Json | null;
          output?: Json | null;
          plugin_id?: string | null;
          status?: string;
          strategy_id?: string | null;
          tenant_id?: string | null;
          xp_earned?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "plugin_logs_agent_version_id_fkey";
            columns: ["agent_version_id"];
            isOneToOne: false;
            referencedRelation: "agent_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plugin_logs_plugin_id_fkey";
            columns: ["plugin_id"];
            isOneToOne: false;
            referencedRelation: "plugins";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plugin_logs_strategy_id_fkey";
            columns: ["strategy_id"];
            isOneToOne: false;
            referencedRelation: "strategies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plugin_logs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      plugins: {
        Row: {
          category: string | null;
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          metadata: Json | null;
          name: string;
          roi: number | null;
          status: string;
          tenant_id: string | null;
          updated_at: string | null;
          xp: number | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          metadata?: Json | null;
          name: string;
          roi?: number | null;
          status: string;
          tenant_id?: string | null;
          updated_at?: string | null;
          xp?: number | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          metadata?: Json | null;
          name?: string;
          roi?: number | null;
          status?: string;
          tenant_id?: string | null;
          updated_at?: string | null;
          xp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "plugins_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          onboarding_completed: boolean | null;
          preferences: Json | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          onboarding_completed?: boolean | null;
          preferences?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          onboarding_completed?: boolean | null;
          preferences?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      strategies: {
        Row: {
          approved_by: string | null;
          completion_percentage: number | null;
          created_at: string | null;
          created_by: string | null;
          created_by_ai: boolean | null;
          description: string;
          due_date: string | null;
          id: string;
          priority: string | null;
          status: string;
          tags: string[] | null;
          tenant_id: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          approved_by?: string | null;
          completion_percentage?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          created_by_ai?: boolean | null;
          description: string;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          status: string;
          tags?: string[] | null;
          tenant_id?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          approved_by?: string | null;
          completion_percentage?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          created_by_ai?: boolean | null;
          description?: string;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          status?: string;
          tags?: string[] | null;
          tenant_id?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "strategies_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at: string | null;
          canceled_at: string | null;
          created_at: string | null;
          current_period_end: string;
          current_period_start: string;
          id: string;
          metadata: Json | null;
          plan_id: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tenant_id: string;
          updated_at: string | null;
        };
        Insert: {
          cancel_at?: string | null;
          canceled_at?: string | null;
          created_at?: string | null;
          current_period_end: string;
          current_period_start: string;
          id?: string;
          metadata?: Json | null;
          plan_id: string;
          status: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tenant_id: string;
          updated_at?: string | null;
        };
        Update: {
          cancel_at?: string | null;
          canceled_at?: string | null;
          created_at?: string | null;
          current_period_end?: string;
          current_period_start?: string;
          id?: string;
          metadata?: Json | null;
          plan_id?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tenant_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      system_logs: {
        Row: {
          context: Json | null;
          created_at: string | null;
          event: string;
          id: string;
          module: string;
          tenant_id: string | null;
        };
        Insert: {
          context?: Json | null;
          created_at?: string | null;
          event: string;
          id?: string;
          module: string;
          tenant_id?: string | null;
        };
        Update: {
          context?: Json | null;
          created_at?: string | null;
          event?: string;
          id?: string;
          module?: string;
          tenant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "system_logs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: string;
          tenant_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: string;
          tenant_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: string;
          tenant_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_user_roles_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          created_at: string | null;
          id: string;
          metadata: Json | null;
          name: string;
          owner_id: string | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          name: string;
          owner_id?: string | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          name?: string;
          owner_id?: string | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_api_key: {
        Args: {
          p_name: string;
          p_tenant_id: string;
          p_scope?: string[];
          p_expires_at?: string;
        };
        Returns: {
          id: string;
          key: string;
          key_prefix: string;
        }[];
      };
      is_tenant_admin: {
        Args: { tenant_id: string };
        Returns: boolean;
      };
      is_tenant_member: {
        Args: { tenant_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
