
import React from 'react';

const GraphLegend: React.FC = () => {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
        <span className="text-sm">Strategies</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-purple-600"></div>
        <span className="text-sm">Plugins</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-green-500"></div>
        <span className="text-sm">Agent Versions</span>
      </div>
    </div>
  );
};

export default GraphLegend;
