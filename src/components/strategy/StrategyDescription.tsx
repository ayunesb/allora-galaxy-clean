
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StrategyDescriptionProps {
  description: string;
}

export const StrategyDescription: React.FC<StrategyDescriptionProps> = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongDescription = description.length > 300;
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const displayedDescription = isLongDescription && !expanded 
    ? `${description.substring(0, 300)}...` 
    : description;

  return (
    <div className="space-y-2">
      <p className="text-sm whitespace-pre-line">{displayedDescription}</p>
      
      {isLongDescription && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpanded}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show more
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default StrategyDescription;
