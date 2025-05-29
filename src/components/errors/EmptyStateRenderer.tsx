import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface EmptyStateRendererProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyStateRenderer: React.FC<EmptyStateRendererProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <Card>
      <CardHeader className="text-center">
        {icon && <div className="mb-2 flex justify-center">{icon}</div>}
        <h3 className="text-lg font-medium">{title}</h3>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
};

export default EmptyStateRenderer;
