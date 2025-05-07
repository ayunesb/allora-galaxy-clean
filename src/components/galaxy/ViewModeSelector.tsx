
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ViewModeSelectorProps {
  viewMode: string;
  setViewMode: (value: string) => void;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">View:</span>
      <Select value={viewMode} onValueChange={setViewMode}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="View mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Entities</SelectItem>
          <SelectItem value="strategy">Strategies Only</SelectItem>
          <SelectItem value="plugin">Plugins Only</SelectItem>
          <SelectItem value="agent">Agents Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ViewModeSelector;
