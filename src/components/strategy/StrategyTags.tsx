
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface StrategyTagsProps {
  tags: string[];
}

export const StrategyTags: React.FC<StrategyTagsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <Badge key={index} variant="outline" className="flex items-center gap-1">
          <Tag className="h-3 w-3" />
          {tag}
        </Badge>
      ))}
    </div>
  );
};

export default StrategyTags;
