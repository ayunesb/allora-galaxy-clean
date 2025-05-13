
import { Plugin } from '@/types/plugin';
import { PluginGrid } from '../PluginGrid';

interface TopPerformersTabProps {
  plugins: Plugin[];
  loading: boolean;
  onClearFilters: () => void;
}

export const TopPerformersTab = ({ plugins, loading, onClearFilters }: TopPerformersTabProps) => {
  return (
    <PluginGrid
      plugins={plugins}
      loading={loading}
      onClearFilters={onClearFilters}
    />
  );
};
