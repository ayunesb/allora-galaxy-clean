
import React from 'react';
import { cn } from '@/lib/utils';

interface DocumentationSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DocumentationSection: React.FC<DocumentationSectionProps> = ({
  title,
  children,
  className
}) => {
  return (
    <div className={cn("mb-6 last:mb-0", className)}>
      <h3 className="text-lg font-medium mb-2 text-primary">{title}</h3>
      <div className="text-muted-foreground space-y-2">
        {children}
      </div>
    </div>
  );
};

export default DocumentationSection;
