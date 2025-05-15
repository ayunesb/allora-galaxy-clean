
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StrategyTagsProps {
  tags?: string[];
}

export const StrategyTags: React.FC<StrategyTagsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default StrategyTags;
