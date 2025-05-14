
import { AgentEvolutionTab } from './AgentEvolutionTab';
import { PluginEvolutionTab } from './PluginEvolutionTab';
import { StrategyEvolutionTab } from './StrategyEvolutionTab';
import { EvolutionDashboard } from './EvolutionDashboard';
import AuditLog from './AuditLog';
// Use type-only export for AuditLogItem to avoid conflicts
export type { AuditLogItem } from './AuditLog';
export { default as LogDetailDialog } from './logs/LogDetailDialog';

export {
  AgentEvolutionTab,
  PluginEvolutionTab,
  StrategyEvolutionTab,
  EvolutionDashboard,
  AuditLog
};
