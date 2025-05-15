
import AuditLog from './AuditLog';
import LogDetailDialog from './LogDetailDialog';
import EvolutionDashboard from './EvolutionDashboard';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import AgentEvolutionTab from './AgentEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';

// Re-export components from strategy directory
export { 
  EvolutionHistory, 
  ExecutionLogs, 
  StrategyDetails, 
  StrategyLoadingSkeleton 
} from './strategy';

// Re-export hooks
export { useStrategyEvolution } from './strategy/useStrategyEvolution';
export { default as useStrategyData } from './strategy/hooks/useStrategyData';

// Import from agent/evolution
import AgentPerformanceMetrics from '../agent/evolution/AgentPerformanceMetrics';
import AgentEvolutionChart from '../agent/evolution/AgentEvolutionChart';

export {
  AuditLog,
  LogDetailDialog,
  EvolutionDashboard,
  StrategyEvolutionTab,
  AgentEvolutionTab,
  PluginEvolutionTab,
  AgentPerformanceMetrics,
  AgentEvolutionChart
};

export default EvolutionDashboard;
