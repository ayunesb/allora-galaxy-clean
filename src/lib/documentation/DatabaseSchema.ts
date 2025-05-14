
/**
 * @file Database Schema Documentation
 * Comprehensive documentation of database tables, relationships, and RLS policies
 */

import { TableSchema } from "@/types/documentation";

/**
 * Database schema documentation for all tables in Allora OS
 */
export const databaseSchema: TableSchema[] = [
  {
    name: "tenants",
    description: "Stores multi-tenant organization information",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "name", type: "text", description: "Organization name", nullable: false },
      { name: "slug", type: "text", description: "URL-friendly identifier", nullable: false },
      { name: "owner_id", type: "uuid", description: "Reference to owner user", nullable: true, isForeignKey: true, references: { table: "auth.users", column: "id" } },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: true },
      { name: "updated_at", type: "timestamp with time zone", description: "Last update timestamp", nullable: true },
      { name: "metadata", type: "jsonb", description: "Additional tenant metadata", nullable: true }
    ],
    rlsPolicies: [
      { name: "tenant_select", operation: "SELECT", definition: "auth.uid() IN (SELECT user_id FROM tenant_user_roles WHERE tenant_id = id)" },
      { name: "tenant_insert", operation: "INSERT", definition: "auth.uid() = owner_id" },
      { name: "tenant_update", operation: "UPDATE", definition: "auth.uid() IN (SELECT user_id FROM tenant_user_roles WHERE tenant_id = id AND role IN ('owner', 'admin'))" }
    ]
  },
  
  {
    name: "tenant_user_roles",
    description: "Manages user roles within tenants for access control",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "tenant_id", type: "uuid", description: "Reference to tenant", nullable: true, isForeignKey: true, references: { table: "tenants", column: "id" } },
      { name: "user_id", type: "uuid", description: "Reference to user", nullable: true, isForeignKey: true, references: { table: "auth.users", column: "id" } },
      { name: "role", type: "text", description: "User's role in the tenant", nullable: false },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: true }
    ],
    rlsPolicies: [
      { name: "tenant_user_roles_select", operation: "SELECT", definition: "is_tenant_member(tenant_id)" },
      { name: "tenant_user_roles_insert", operation: "INSERT", definition: "is_tenant_admin(tenant_id)" },
      { name: "tenant_user_roles_update", operation: "UPDATE", definition: "is_tenant_admin(tenant_id)" },
      { name: "tenant_user_roles_delete", operation: "DELETE", definition: "is_tenant_admin(tenant_id)" },
      { name: "tenant_owner_full_access", operation: "ALL", definition: "EXISTS (SELECT 1 FROM tenants WHERE tenants.id = tenant_id AND tenants.owner_id = auth.uid())" }
    ]
  },

  {
    name: "strategies",
    description: "Business strategies that can be executed with plugins",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "tenant_id", type: "uuid", description: "Reference to tenant", nullable: true, isForeignKey: true, references: { table: "tenants", column: "id" } },
      { name: "title", type: "text", description: "Strategy title", nullable: false },
      { name: "description", type: "text", description: "Strategy description", nullable: false },
      { name: "status", type: "text", description: "Current status", nullable: false },
      { name: "created_by", type: "uuid", description: "Reference to creator", nullable: true, isForeignKey: true, references: { table: "auth.users", column: "id" } },
      { name: "approved_by", type: "uuid", description: "Reference to approver", nullable: true, isForeignKey: true, references: { table: "auth.users", column: "id" } },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: true },
      { name: "updated_at", type: "timestamp with time zone", description: "Last update timestamp", nullable: true },
      { name: "due_date", type: "timestamp with time zone", description: "Strategy due date", nullable: true },
      { name: "priority", type: "text", description: "Strategy priority level", nullable: true },
      { name: "tags", type: "text[]", description: "Tag array for categorization", nullable: true },
      { name: "completion_percentage", type: "integer", description: "Completion percentage", nullable: true }
    ],
    rlsPolicies: [
      { name: "strategies_select", operation: "SELECT", definition: "auth.uid() IN (SELECT user_id FROM tenant_user_roles WHERE tenant_id = tenant_id)" }
    ]
  },

  {
    name: "plugins",
    description: "Modular extensions that add functionality",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "name", type: "text", description: "Plugin name", nullable: false },
      { name: "description", type: "text", description: "Plugin description", nullable: true },
      { name: "status", type: "text", description: "Current status", nullable: false },
      { name: "xp", type: "integer", description: "Experience points", nullable: true },
      { name: "roi", type: "integer", description: "Return on investment metric", nullable: true },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: true },
      { name: "updated_at", type: "timestamp with time zone", description: "Last update timestamp", nullable: true },
      { name: "icon", type: "text", description: "Icon identifier", nullable: true },
      { name: "category", type: "text", description: "Plugin category", nullable: true },
      { name: "metadata", type: "jsonb", description: "Additional plugin metadata", nullable: true },
      { name: "tenant_id", type: "uuid", description: "Reference to tenant", nullable: true, isForeignKey: true, references: { table: "tenants", column: "id" } }
    ]
  },

  {
    name: "agent_versions",
    description: "Version history for AI agents",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "plugin_id", type: "uuid", description: "Reference to plugin", nullable: true, isForeignKey: true, references: { table: "plugins", column: "id" } },
      { name: "version", type: "text", description: "Version string", nullable: false },
      { name: "prompt", type: "text", description: "Agent prompt template", nullable: false },
      { name: "status", type: "text", description: "Current status", nullable: false },
      { name: "xp", type: "integer", description: "Experience points", nullable: true },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: true },
      { name: "updated_at", type: "timestamp with time zone", description: "Last update timestamp", nullable: true },
      { name: "created_by", type: "uuid", description: "Reference to creator", nullable: true, isForeignKey: true, references: { table: "auth.users", column: "id" } },
      { name: "upvotes", type: "integer", description: "Number of upvotes", nullable: true },
      { name: "downvotes", type: "integer", description: "Number of downvotes", nullable: true }
    ]
  },

  {
    name: "plugin_logs",
    description: "Execution logs for plugins",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "plugin_id", type: "uuid", description: "Reference to plugin", nullable: true, isForeignKey: true, references: { table: "plugins", column: "id" } },
      { name: "strategy_id", type: "uuid", description: "Reference to strategy", nullable: true, isForeignKey: true, references: { table: "strategies", column: "id" } },
      { name: "tenant_id", type: "uuid", description: "Reference to tenant", nullable: true, isForeignKey: true, references: { table: "tenants", column: "id" } },
      { name: "agent_version_id", type: "uuid", description: "Reference to agent version", nullable: true, isForeignKey: true, references: { table: "agent_versions", column: "id" } },
      { name: "status", type: "text", description: "Execution status", nullable: false },
      { name: "input", type: "jsonb", description: "Input parameters", nullable: true },
      { name: "output", type: "jsonb", description: "Output results", nullable: true },
      { name: "error", type: "text", description: "Error message if failed", nullable: true },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: true },
      { name: "execution_time", type: "float", description: "Execution time in seconds", nullable: true },
      { name: "xp_earned", type: "integer", description: "XP earned from execution", nullable: true }
    ]
  },

  {
    name: "kpis",
    description: "Key Performance Indicators for business tracking",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "tenant_id", type: "uuid", description: "Reference to tenant", nullable: true, isForeignKey: true, references: { table: "tenants", column: "id" } },
      { name: "name", type: "text", description: "KPI name", nullable: false },
      { name: "value", type: "float", description: "Current value", nullable: false },
      { name: "previous_value", type: "float", description: "Previous value for trend calculation", nullable: true },
      { name: "source", type: "text", description: "Data source identifier", nullable: true },
      { name: "category", type: "text", description: "KPI category", nullable: true },
      { name: "date", type: "date", description: "Measurement date", nullable: false },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: true },
      { name: "updated_at", type: "timestamp with time zone", description: "Last update timestamp", nullable: true }
    ]
  },

  {
    name: "agent_votes",
    description: "User votes on agent versions",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "agent_version_id", type: "uuid", description: "Reference to agent version", nullable: true, isForeignKey: true, references: { table: "agent_versions", column: "id" } },
      { name: "user_id", type: "uuid", description: "Reference to user", nullable: true, isForeignKey: true, references: { table: "auth.users", column: "id" } },
      { name: "vote_type", type: "text", description: "Vote type (up/down)", nullable: false },
      { name: "comment", type: "text", description: "Optional comment", nullable: true },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: true }
    ]
  },
  
  {
    name: "notifications",
    description: "User notifications across the platform",
    columns: [
      { name: "id", type: "uuid", description: "Unique identifier", nullable: false, isPrimaryKey: true },
      { name: "tenant_id", type: "uuid", description: "Reference to tenant", nullable: false, isForeignKey: true, references: { table: "tenants", column: "id" } },
      { name: "user_id", type: "uuid", description: "Reference to user", nullable: false, isForeignKey: true, references: { table: "auth.users", column: "id" } },
      { name: "title", type: "text", description: "Notification title", nullable: false },
      { name: "description", type: "text", description: "Notification description", nullable: true },
      { name: "type", type: "text", description: "Notification type", nullable: false },
      { name: "is_read", type: "boolean", description: "Read status", nullable: false },
      { name: "action_url", type: "text", description: "Optional action URL", nullable: true },
      { name: "action_label", type: "text", description: "Optional action button label", nullable: true },
      { name: "module", type: "text", description: "Source module", nullable: true },
      { name: "created_at", type: "timestamp with time zone", description: "Creation timestamp", nullable: false },
      { name: "updated_at", type: "timestamp with time zone", description: "Last update timestamp", nullable: false }
    ],
    rlsPolicies: [
      { name: "Users can view their own notifications", operation: "SELECT", definition: "auth.uid() = user_id" },
      { name: "Users can update their own notifications", operation: "UPDATE", definition: "auth.uid() = user_id" },
      { name: "Users can delete their own notifications", operation: "DELETE", definition: "auth.uid() = user_id" },
      { name: "Users can insert notifications for themselves", operation: "INSERT", definition: "auth.uid() = user_id OR public.is_tenant_admin(tenant_id)" }
    ]
  }
];

/**
 * Entity relationship diagram documentation
 */
export const entityRelationships = `
# Entity Relationship Diagram

## Core Entities
- **tenants**: Central organization entity
- **users**: Authentication users (in auth schema)
- **tenant_user_roles**: Many-to-many relationship between tenants and users

## Business Entities
- **strategies**: Business strategies with tenant ownership
- **plugins**: Modular extensions that can be used in strategies
- **agent_versions**: Version history for AI agents connected to plugins
- **kpis**: Key Performance Indicators with tenant ownership

## Activity & Logging
- **plugin_logs**: Execution logs for plugins
- **system_logs**: System-wide audit logs
- **agent_votes**: User feedback on agent versions
- **notifications**: User notifications

## Key Relationships
- Each tenant has many users (through tenant_user_roles)
- Each strategy belongs to one tenant
- Each plugin can have many agent versions
- Plugin logs track execution of plugins within strategies
- Agent votes provide feedback on specific agent versions
`;

/**
 * Security model documentation
 */
export const securityModel = `
# Security Model

## Row-Level Security (RLS)
Allora OS uses PostgreSQL's Row-Level Security (RLS) for data isolation between tenants.

## Key Security Functions
- \`is_tenant_member(tenant_id UUID)\`: Checks if current user is a member of specified tenant
- \`is_tenant_admin(tenant_id UUID)\`: Checks if current user is an admin in specified tenant

## Role-Based Access Control
User roles in a tenant:
- **owner**: Full control, can perform all operations
- **admin**: Can manage users and resources within tenant
- **member**: Standard access to tenant resources
- **viewer**: Read-only access to tenant resources

## Security Best Practices
- All tables have appropriate RLS policies
- Security definer functions prevent recursive RLS issues
- API endpoints validate tenant membership before operations
- Edge functions verify permissions before execution
`;

/**
 * Export the database documentation
 */
export const databaseDocumentation = {
  schema: databaseSchema,
  entityRelationships,
  securityModel
};
