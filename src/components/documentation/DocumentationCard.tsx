
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface DocumentationCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const DocumentationCard: React.FC<DocumentationCardProps> = ({
  title,
  description,
  children,
  className,
  icon = <BookOpen className="h-5 w-5 text-primary" />
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50 flex flex-row items-center gap-2 pb-2">
        <div className="bg-primary/10 p-2 rounded-full">
          {icon}
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default DocumentationCard;
