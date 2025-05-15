
import React from 'react';

interface StrategyDescriptionProps {
  description: string;
}

export const StrategyDescription: React.FC<StrategyDescriptionProps> = ({ description }) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Description</h3>
      <p className="mt-2 text-muted-foreground whitespace-pre-line">{description}</p>
    </div>
  );
};

export default StrategyDescription;
