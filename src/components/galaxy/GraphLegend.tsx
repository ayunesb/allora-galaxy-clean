
import React from 'react';

interface LegendItem {
  type: string;
  color: string;
  label: string;
}

interface GraphLegendProps {
  items: LegendItem[];
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ items }) => {
  return (
    <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-md">
      <div className="flex flex-col space-y-1">
        {items.map((item) => (
          <div key={item.type} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
