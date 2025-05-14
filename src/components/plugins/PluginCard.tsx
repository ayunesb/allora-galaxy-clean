
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon, CheckIcon, StarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PluginCardProps {
  id: string | number;
  name: string;
  description: string;
  category: string;
  installed?: boolean;
  rating?: number;
  usersCount?: number;
  xp?: number;
  version?: string;
  onInstall?: (id: string | number) => void;
  onUninstall?: (id: string | number) => void;
  onClick?: (id: string | number) => void;
  className?: string;
}

const PluginCard: React.FC<PluginCardProps> = ({
  id,
  name,
  description,
  category,
  installed = false,
  rating = 0,
  usersCount = 0,
  xp = 0,
  version = "1.0.0",
  onInstall,
  onUninstall,
  onClick,
  className
}) => {
  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (installed && onUninstall) {
      onUninstall(id);
    } else if (onInstall) {
      onInstall(id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <Card 
      className={cn("h-full transition-shadow hover:shadow-md cursor-pointer", className)} 
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge variant="outline">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex text-sm text-muted-foreground">
          <span className="flex items-center mr-4">
            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            {rating.toFixed(1)}
            <span className="ml-1">({usersCount})</span>
          </span>
          <span className="mr-auto">v{version}</span>
          <span>XP: {xp}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          size="sm" 
          variant={installed ? "outline" : "default"} 
          className="ml-auto" 
          onClick={handleInstallClick}
        >
          {installed ? (
            <>
              <CheckIcon className="h-4 w-4 mr-1" />
              Installed
            </>
          ) : (
            <>
              <PlusCircleIcon className="h-4 w-4 mr-1" />
              Install
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PluginCard;
