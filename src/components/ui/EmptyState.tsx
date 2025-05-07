
import React, { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-4">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
