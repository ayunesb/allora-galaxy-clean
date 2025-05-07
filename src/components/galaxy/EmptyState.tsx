
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-96">
      <p className="text-xl font-medium">No data available</p>
      <p className="text-muted-foreground mt-2">Try adding some strategies or plugins</p>
    </div>
  );
};

export default EmptyState;
